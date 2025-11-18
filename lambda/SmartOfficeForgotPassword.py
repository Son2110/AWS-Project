import boto3
import json
import os
import botocore.exceptions

# Lấy Cognito Client ID từ environment variable
COGNITO_CLIENT_ID = os.environ['COGNITO_CLIENT_ID']
# Khởi tạo Cognito client
cognito_client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    """
    Lambda function gửi mã xác thực reset password qua email
    
    Flow:
        - User nhập email và submit
        - Lambda gọi Cognito forgot_password
        - Cognito tự động gửi email chứa mã 6 số cho user
    
    Input (từ API Gateway):
        - username: Email của user
    
    Output:
        - 200: Mã xác thực đã được gửi qua email
        - 400: Thiếu username
        - 500: Lỗi server hoặc Cognito
    """
    try:
        # Parse request body từ API Gateway event
        if 'body' in event and event['body'] is not None:
            body = json.loads(event.get('body', '{}'))
        else:
            body = event

        # Lấy username (email) từ request
        username = body.get('username')

        # Validate username có tồn tại không
        if not username:
            return api_response(400, {'message': 'Username is required'})

        # Gọi Cognito forgot_password
        # Cognito sẽ TỰ ĐỘNG gửi email chứa mã xác thực 6 số
        cognito_client.forgot_password(
            ClientId=COGNITO_CLIENT_ID,
            Username=username
        )

        # Trả về response thành công
        return api_response(200, {'message': f'Confirmation code sent to {username}'})

    except botocore.exceptions.ClientError as e:
        # Lỗi từ Cognito (ví dụ: user không tồn tại)
        return api_response(500, {'message': f'Cognito error: {str(e)}'})
        
    except Exception as e:
        # Lỗi không xác định
        return api_response(500, {'message': f'Internal server error: {str(e)}'})

def api_response(status_code, body):
    """
    Helper function tạo response theo format API Gateway Lambda Proxy Integration
    
    Args:
        status_code: HTTP status code
        body: Dictionary chứa response data
    
    Returns:
        Dictionary với statusCode, headers, và body (JSON string)
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',              # Cho phép CORS
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        'body': json.dumps(body)
    }