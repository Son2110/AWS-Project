import json
import boto3

# Khởi tạo Cognito client (không khai báo region ap-southeast-1 để dùng được cho nhiều region)
cognito_client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    """
    Lambda function xử lý logout user khỏi Cognito
    
    Flow:
        - Frontend gửi id_token qua Authorization header (cho API Gateway Cognito Authorizer)
        - Frontend gửi access_token trong request body (cho Lambda function này)
        - Lambda gọi global_sign_out để vô hiệu hóa token trên tất cả devices
    
    Input (từ API Gateway):
        - access_token: Access token từ request body
    
    Output:
        - 200: Logout thành công
        - 400: Thiếu access_token
        - 401: Token không hợp lệ hoặc đã hết hạn
        - 500: Lỗi server
    """
    try:
        # Parse request body để lấy access_token
        body = json.loads(event.get('body', '{}'))
        access_token = body.get('access_token', '').strip()
        
        # Validate access_token có tồn tại không
        if not access_token:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'message': 'Missing access_token in request body'})
            }
        
        # Gọi Cognito global_sign_out để vô hiệu hóa token
        # Token sẽ không còn hiệu lực trên TẤT CẢ devices của user
        cognito_client.global_sign_out(AccessToken=access_token)
        
        # Trả về response thành công
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'message': 'Logout successful'})
        }
        
    except cognito_client.exceptions.NotAuthorizedException:
        # Token không hợp lệ hoặc đã hết hạn
        return {
            'statusCode': 401,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'message': 'Token expired or invalid'})
        }
        
    except Exception as e:
        # Lỗi không xác định - log ra CloudWatch
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'message': 'Internal server error'})
        }