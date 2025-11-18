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
    Lambda function xác nhận reset password với mã xác thực
    
    Flow:
        - User nhận mã 6 số từ email (từ forgot_password)
        - User nhập: mã xác thực + password mới
        - Lambda gọi confirm_forgot_password để đổi password
        - User có thể login với password mới
    
    Input (từ API Gateway):
        - username: Email của user
        - code: Mã xác thực 6 số từ email
        - new_password: Password mới
    
    Output:
        - 200: Password đã được reset thành công
        - 400: Thiếu input, mã sai, hoặc mã hết hạn
        - 429: Quá nhiều lần thử (rate limit)
        - 500: Lỗi server
    
    Password requirements (AWS Cognito):
        - Tối thiểu 8 ký tự
        - Có chữ hoa (A-Z)
        - Có chữ thường (a-z)
        - Có số (0-9)
        - Có ký tự đặc biệt (@$!%*?&)
    """
    try:
        # Parse request body từ API Gateway event
        if 'body' in event and event['body'] is not None:
            body = json.loads(event.get('body', '{}'))
        else:
            body = event

        # Lấy parameters từ request
        username = body.get('username')           # Email
        code = body.get('code')                   # Mã 6 số từ email
        new_password = body.get('new_password')   # Password mới

        # Validate tất cả fields phải có
        if not username or not code or not new_password:
            return api_response(400, {'message': 'Username, code, and new password are required'})

        # Gọi Cognito confirm_forgot_password
        # Cognito sẽ validate mã xác thực và đổi password
        cognito_client.confirm_forgot_password(
            ClientId=COGNITO_CLIENT_ID,
            Username=username,
            ConfirmationCode=code,
            Password=new_password
        )

        # Trả về response thành công
        return api_response(200, {'message': 'Password has been reset successfully'})

    except botocore.exceptions.ClientError as e:
        # Xử lý các lỗi cụ thể từ Cognito
        error_code = e.response.get('Error', {}).get('Code')
        
        if error_code == 'CodeMismatchException':
            # Mã xác thực không đúng
            return api_response(400, {'message': 'Invalid confirmation code'})
        elif error_code == 'ExpiredCodeException':
            # Mã xác thực đã hết hạn (thường là 1 giờ)
            return api_response(400, {'message': 'Confirmation code has expired'})
        elif error_code == 'LimitExceededException':
            # User thử quá nhiều lần (rate limit)
            return api_response(429, {'message': 'Attempt limit exceeded, please try again later'})
        else:
            # Các lỗi khác từ Cognito
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