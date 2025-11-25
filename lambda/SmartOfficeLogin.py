import boto3
import json
import os
import base64
from datetime import datetime
import botocore.exceptions

# Environment variables
COGNITO_CLIENT_ID = os.environ['COGNITO_CLIENT_ID']
USER_TABLE_NAME = os.environ.get('USER_TABLE_NAME', 'SmartOffice_User_Prod')

# Initialize AWS clients
cognito_client = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')
user_table = dynamodb.Table(USER_TABLE_NAME)

def lambda_handler(event, context):
    """
    Lambda function xử lý:
    1. Đăng nhập user với AWS Cognito
    2. Tự động tạo/cập nhật user record trong DynamoDB
    
    Input (từ API Gateway):
        - username: Email của user
        - password: Mật khẩu
    
    Output:
        - 200: Trả về access_token, id_token, refresh_token + user info
        - 401: Sai username/password
        - 403: User chưa được confirm
        - 404: User không tồn tại
        - 500: Lỗi server
    
    DynamoDB Schema (SmartOffice_User_Prod):
        - userId (String, PK): UUID hoặc Cognito sub
        - companyId (String): Link to office (Foreign Key)
        - name (String): User name
        - email (String): Email for login
        - role (String): "admin" hoặc "manager"
        - offices (List<String>): List of officeId that user manage (FK)
        - createdAt, updatedAt, lastLogin (String): ISO timestamps
    """
    try:
        # Parse request body từ API Gateway event
        if 'body' in event and event['body'] is not None:
            body = json.loads(event.get('body', '{}'))
        else:
            body = event

        # Lấy username và password từ request
        username = body.get('username')
        password = body.get('password')

        # Validate input
        if not username or not password:
            return api_response(400, {'message': 'Username and password are required'})

        # Gọi Cognito để authenticate user
        # USER_PASSWORD_AUTH flow: Xác thực bằng username/password
        response = cognito_client.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password
            }
        )

        # Lấy kết quả authentication (chứa tokens)
        auth_result = response.get('AuthenticationResult', {})

        # Kiểm tra xem có AccessToken không (login thành công)
        if 'AccessToken' not in auth_result:
            # Nếu không có token, có thể là challenge (ví dụ: phải đổi password)
            challenge = response.get('ChallengeName', 'UNKNOWN_CHALLENGE')
            return api_response(403, {'message': f'Login failed: {challenge}'})

        access_token = auth_result.get('AccessToken')
        id_token = auth_result.get('IdToken')
        refresh_token = auth_result.get('RefreshToken')

        # Lấy thông tin user từ Cognito
        user_info = cognito_client.get_user(AccessToken=access_token)
        
        # Extract user attributes
        user_attributes = {attr['Name']: attr['Value'] for attr in user_info.get('UserAttributes', [])}
        
        user_id = user_attributes.get('sub')  # Cognito unique ID
        email = user_attributes.get('email', username)
        name = user_attributes.get('name', email.split('@')[0])
        email_verified = user_attributes.get('email_verified', 'false') == 'true'

        # Decode JWT để lấy Cognito Groups và map sang role
        cognito_groups = []
        role = 'manager'  # Default role
        
        try:
            token_parts = access_token.split('.')
            if len(token_parts) >= 2:
                payload = token_parts[1]
                # Add padding for base64
                padding = 4 - len(payload) % 4
                if padding != 4:
                    payload += '=' * padding
                
                decoded_payload = json.loads(base64.b64decode(payload))
                cognito_groups = decoded_payload.get('cognito:groups', [])
                
                # Map Cognito Groups sang role
                if 'Admin' in cognito_groups:
                    role = 'admin'
                elif 'Manager' in cognito_groups:
                    role = 'manager'
                else:
                    role = 'manager'  # Default
                    
        except Exception as decode_error:
            print(f"Error decoding token: {decode_error}")

        # Tạo/cập nhật user trong DynamoDB
        current_time = datetime.utcnow().isoformat() + 'Z'
        
        try:
            existing_user = user_table.get_item(Key={'userId': user_id})
            user_office_id = ''  # Default empty
            
            if 'Item' in existing_user:
                # Get existing user data
                existing_item = existing_user['Item']
                
                # Lấy danh sách offices (array) từ User table
                user_offices = existing_item.get('offices', [])
                
                # Lấy primary officeId (nếu có, lấy office đầu tiên)
                user_office_id = user_offices[0] if user_offices else ''
                
                print(f"DEBUG - User offices: {user_offices}, primary officeId: {user_office_id}")
                
                # GIỮ NGUYÊN name và email từ DynamoDB (đã được user/admin set)
                # CHỈ update role (từ Cognito Groups) và lastLogin
                user_table.update_item(
                    Key={'userId': user_id},
                    UpdateExpression='SET #role = :role, updatedAt = :updated, lastLogin = :lastLogin',
                    ExpressionAttributeNames={
                        '#role': 'role'
                    },
                    ExpressionAttributeValues={
                        ':role': role,
                        ':updated': current_time,
                        ':lastLogin': current_time
                    }
                )
                
                # Lấy name và email từ DB để trả về (không dùng từ Cognito)
                name = existing_item.get('name', name)
                email = existing_item.get('email', email)
                
                print(f"Updated user: {user_id} (kept existing name and email)")
            else:
                # Create new user với schema mới
                user_table.put_item(Item={
                    'userId': user_id,
                    'companyId': '',  # Sẽ được set sau bởi admin
                    'name': name,
                    'email': email,
                    'role': role,
                    'offices': [],  # Empty list, sẽ được assign sau bởi admin
                    'createdAt': current_time,
                    'updatedAt': current_time,
                    'lastLogin': current_time
                })
                user_office_id = ''  # User mới chưa có office
                print(f"Created new user: {user_id}")
                
        except Exception as db_error:
            # Log error nhưng không block login
            print(f"DynamoDB error: {str(db_error)}")

        # Trả về tokens + user info (bao gồm officeId)
        return api_response(200, {
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'id_token': id_token,
            'user': {
                'userId': user_id,
                'email': email,
                'name': name,
                'role': role,
                'officeId': user_office_id,  # Trả về officeId để frontend lưu localStorage
                'cognitoGroups': cognito_groups  # Giữ lại để frontend tương thích
            }
        })

    except botocore.exceptions.ClientError as e:
        # Xử lý các lỗi từ Cognito
        error_code = e.response.get('Error', {}).get('Code')
        
        if error_code == 'NotAuthorizedException':
            # Sai username hoặc password
            return api_response(401, {'message': 'Invalid username or password'})
        elif error_code == 'UserNotFoundException':
            # User không tồn tại trong Cognito User Pool
            return api_response(404, {'message': 'User not found'})
        elif error_code == 'UserNotConfirmedException':
            # User chưa confirm email
            return api_response(403, {'message': 'User is not confirmed'})
        else:
            # Các lỗi khác từ Cognito
            return api_response(500, {'message': f'Cognito error: {str(e)}'})

    except json.JSONDecodeError:
        # Request body không phải JSON hợp lệ
        return api_response(400, {'message': 'Invalid JSON in request body'})

    except Exception as e:
        # Lỗi không xác định
        return api_response(500, {'message': f'Internal server error: {str(e)}'})

def api_response(status_code, body):
    """
    Helper function tạo response theo format API Gateway Lambda Proxy Integration
    
    Args:
        status_code: HTTP status code (200, 400, 401, etc.)
        body: Dictionary chứa response data
    
    Returns:
        Dictionary với statusCode, headers, và body (JSON string)
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        'body': json.dumps(body)  # Convert dict sang JSON string
    }