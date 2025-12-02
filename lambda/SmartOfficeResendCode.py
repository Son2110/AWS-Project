import json
import boto3
import os
from botocore.exceptions import ClientError

cognito_client = boto3.client('cognito-idp')

CLIENT_ID = os.environ.get('CLIENT_ID')

def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        
        # Validate required fields
        if not email:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Missing required field: email'
                })
            }
        
        # Resend confirmation code
        try:
            cognito_client.resend_confirmation_code(
                ClientId=CLIENT_ID,
                Username=email
            )
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'UserNotFoundException':
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'message': 'User not found'
                    })
                }
            elif error_code == 'InvalidParameterException':
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'message': 'User is already confirmed'
                    })
                }
            else:
                raise e
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Verification code resent successfully. Please check your email.'
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Internal server error',
                'error': str(e)
            })
        }
