import boto3
import json
import os
import base64
from datetime import datetime
import botocore.exceptions

# Environment variables
COGNITO_CLIENT_ID = os.environ['COGNITO_CLIENT_ID']
OFFICE_TABLE_NAME = os.environ.get('OFFICE_TABLE_NAME')
MANAGER_TABLE_NAME = os.environ.get('MANAGER_TABLE_NAME')

# Initialize AWS clients
cognito_client = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')
office_table = dynamodb.Table(OFFICE_TABLE_NAME)
manager_table = dynamodb.Table(MANAGER_TABLE_NAME)

def lambda_handler(event, context):
    
    try:
        # Parse request body từ API Gateway event
        if 'body' in event and event['body'] is not None:
            body = json.loads(event.get('body', '{}'))
        else:
            body = event

        # Lấy username, password và companyName từ request
        username = body.get('username')
        password = body.get('password')
        company_name = body.get('companyName', '').strip()

        # Validate input
        if not username or not password:
            return api_response(400, {'message': 'Username and password are required'})
        
        if not company_name:
            return api_response(400, {'message': 'Company name is required'})

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
            challenge_name = response.get('ChallengeName', 'UNKNOWN_CHALLENGE')
            session = response.get('Session', '')
            
            if challenge_name == 'NEW_PASSWORD_REQUIRED':
                # User needs to change password
                return api_response(200, {
                    'challengeName': challenge_name,
                    'session': session,
                    'username': username,
                    'message': 'New password required. Please change your password.'
                })
            else:
                # Other challenges
                return api_response(403, {'message': f'Login failed: {challenge_name}'})

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

        # Decode JWT để lấy Cognito Groups (for backward compatibility)
        cognito_groups = []
        
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
                    
        except Exception as decode_error:
            print(f"Error decoding token: {decode_error}")
        
        # Check if user is in Admin or Manager Cognito groups
        is_in_admin_group = 'Admin' in cognito_groups
        is_in_manager_group = 'Manager' in cognito_groups
        
        # Xác định role bằng cách check database
        role = None
        is_admin = False
        admin_org_alias = ''
        is_manager = False
        manager_office_id = ''
        
        # Check Admin role first
        if is_in_admin_group:
            try:
                # Check if user is Admin by checking specific organization
                office_check = office_table.get_item(
                    Key={
                        'orgAlias': company_name,
                        'entityId': 'organization'
                    }
                )
                
                if 'Item' in office_check:
                    office_data = office_check['Item']
                    admin_email_from_db = office_data.get('adminEmail', '')
                    
                    # Verify admin email matches
                    if admin_email_from_db == email:
                        is_admin = True
                        role = 'admin'
                        admin_org_alias = company_name
                        print(f"User {email} identified as Admin for company: {admin_org_alias}")
                    
            except Exception as admin_error:
                print(f"Error checking Admin role: {admin_error}")
        
        # Check Manager role (always check, even for admin users)
        if is_in_manager_group:
            try:
                print(f"DEBUG - Querying Manager table for email: {email}, orgAlias: {company_name}")
                # Query by orgAlias (PK), then filter by managerEmail in code
                manager_query = manager_table.query(
                    KeyConditionExpression='orgAlias = :org',
                    ExpressionAttributeValues={
                        ':org': company_name
                    }
                )
                
                # Filter results by email in code (since managerEmail is not a key)
                managers = manager_query.get('Items', [])
                print(f"DEBUG - Found {len(managers)} managers in org")
                
                matching_managers = [m for m in managers if m.get('managerEmail') == email]
                print(f"DEBUG - Found {len(matching_managers)} managers matching email: {email}")
                
                if matching_managers and len(matching_managers) > 0:
                    is_manager = True
                    manager_data = matching_managers[0]
                    manager_office_id = manager_data.get('assignedOfficeId', '')
                    
                    # If user is both admin and manager, prioritize admin role
                    if not is_admin:
                        role = 'manager'
                    
                    print(f"User {email} has Manager record (assignedOfficeId: {manager_office_id})")
                else:
                    print(f"User {email} in Manager group but no record in Manager table")
                    
            except Exception as manager_error:
                print(f"Error checking Manager role: {manager_error}")
        
        # Kiểm tra: Nếu user không có role nào → KHÔNG CHO LOGIN
        if not role:
            if is_in_admin_group and not is_admin:
                return api_response(403, {
                    'message': 'Access denied. Admin account not found in organization.'
                })
            elif is_in_manager_group and not is_manager:
                return api_response(403, {
                    'message': 'Access denied. Manager account not assigned to any office.'
                })
            else:
                return api_response(403, {
                    'message': 'Access denied. Your account is not registered in the system.'
                })

        # Xác định hasOffice dựa vào role check
        # Admin: Luôn có quyền truy cập (has_office = True)
        # Manager: Chỉ có quyền nếu có officeId trong Manager table
        has_office = True if is_admin else (is_manager and bool(manager_office_id))
        
        # Xác định officeId/orgAlias để trả về
        # Ưu tiên manager_office_id nếu user có trong Manager table (cho admin login vào manager role)
        # Admin: Trả về orgAlias (để list offices) nếu không có manager_office_id
        # Manager: Trả về assignedOfficeId
        office_identifier = manager_office_id if manager_office_id else admin_org_alias
        
        # Trả về tokens + user info (bao gồm officeId và office check)
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
                'orgAlias': company_name,  # Trả về orgAlias cho cả admin và manager
                'officeId': office_identifier,  # orgAlias (admin) hoặc assignedOfficeId (manager)
                'hasOffice': has_office,  # Check if manager has office assigned
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