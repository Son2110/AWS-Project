import boto3
import json
import os
import botocore.exceptions

# Lấy Cognito Client ID từ environment variable
COGNITO_CLIENT_ID = os.environ['COGNITO_CLIENT_ID']
# Khởi tạo Cognito client để gọi API
cognito_client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    """
    Lambda function xử lý đăng nhập user với AWS Cognito
    
    Input (từ API Gateway):
        - username: Email của user
        - password: Mật khẩu
    
    Output:
        - 200: Trả về access_token, id_token, refresh_token
        - 401: Sai username/password
        - 403: User chưa được confirm hoặc có challenge
        - 404: User không tồn tại
        - 500: Lỗi server
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

        # Trả về tokens cho frontend
        return api_response(200, {
            'message': 'Login successful',
            'access_token': auth_result.get('AccessToken'),      # Dùng cho API calls
            'refresh_token': auth_result.get('RefreshToken'),    # Dùng để refresh tokens
            'id_token': auth_result.get('IdToken')               # Chứa user info & groups
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
            'Access-Control-Allow-Origin': '*',                      # Cho phép CORS từ mọi origin
            'Access-Control-Allow-Headers': 'Content-Type',          # Headers được phép
            'Access-Control-Allow-Methods': 'POST, OPTIONS'          # Methods được phép
        },
        'body': json.dumps(body)  # Convert dict sang JSON string
    }