import json
import boto3
import os
from botocore.exceptions import ClientError

cognito_client = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')

USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')
TABLE_NAME = os.environ.get('TABLE_NAME')

table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        password = body.get('password')
        company_name = body.get('companyName')
        
        # Validate required fields
        if not email or not password or not company_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Missing required fields: email, password, companyName'
                })
            }
        
        # Extract admin name from email (part before @)
        admin_name = email.split('@')[0]
        
        # Check if organization name already exists in DynamoDB
        # Query by partition key (orgAlias) only since entityId is always 'organization'
        try:
            existing_org = table.query(
                KeyConditionExpression='orgAlias = :org',
                ExpressionAttributeValues={
                    ':org': company_name
                },
                Limit=1
            )
            if existing_org.get('Items') and len(existing_org['Items']) > 0:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'message': 'Organization name already exists'
                    })
                }
        except ClientError as e:
            print(f"Error checking organization: {str(e)}")
        
        # Sign up user in Cognito (without custom attributes to avoid schema issues)
        try:
            signup_response = cognito_client.sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                Password=password,
                UserAttributes=[
                    {
                        'Name': 'email',
                        'Value': email
                    },
                    {
                        'Name': 'name',
                        'Value': admin_name
                    }
                ],
                ClientMetadata={
                    'companyName': company_name,
                    'adminName': admin_name
                }
            )
            
            user_sub = signup_response['UserSub']
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'UsernameExistsException':
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'message': 'User already exists'
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
                'message': 'Signup successful. Please check your email for verification code.',
                'userSub': user_sub,
                'email': email
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
