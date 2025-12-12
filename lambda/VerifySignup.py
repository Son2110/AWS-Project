import json
import boto3
import os
import time
from botocore.exceptions import ClientError

cognito_client = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')

CLIENT_ID = os.environ.get('CLIENT_ID')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
TABLE_NAME = os.environ.get('TABLE_NAME')

table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        confirmation_code = body.get('code')
        company_name = body.get('companyName')
        
        # Validate required fields
        if not email or not confirmation_code:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Missing required fields: email, code'
                })
            }
        
        # Confirm sign up in Cognito
        try:
            cognito_client.confirm_sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                ConfirmationCode=confirmation_code
            )
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'CodeMismatchException':
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'message': 'Invalid verification code'
                    })
                }
            elif error_code == 'ExpiredCodeException':
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'message': 'Verification code has expired'
                    })
                }
            elif error_code == 'NotAuthorizedException':
                # User already confirmed, continue to create/update DynamoDB record
                print(f"User already confirmed: {email}")
            else:
                raise e
        
        # Get user info from Cognito to retrieve user_sub
        try:
            user_info = cognito_client.admin_get_user(
                UserPoolId=USER_POOL_ID,
                Username=email
            )
            
            # Extract user_sub from attributes
            user_sub = None
            for attr in user_info['UserAttributes']:
                if attr['Name'] == 'sub':
                    user_sub = attr['Value']
                    break
            
            # Extract admin name from email
            admin_name = email.split('@')[0]
            
            # Use provided companyName from request
            retrieved_company_name = company_name if company_name else 'DefaultOrg'
            
        except ClientError as e:
            print(f"Error getting user info: {str(e)}")
            # Use fallback values
            user_sub = None
            admin_name = email.split('@')[0]
            retrieved_company_name = company_name if company_name else 'DefaultOrg'
        
        # Add user to Admin group in Cognito (create group if not exists)
        try:
            cognito_client.admin_add_user_to_group(
                UserPoolId=USER_POOL_ID,
                Username=email,
                GroupName='Admin'
            )
            print(f"User {email} added to Admin group successfully")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'ResourceNotFoundException':
                # Admin group doesn't exist, create it first
                try:
                    print(f"Admin group not found, creating it...")
                    cognito_client.create_group(
                        GroupName='Admin',
                        UserPoolId=USER_POOL_ID,
                        Description='Administrator group with full access',
                        Precedence=1
                    )
                    print(f"Admin group created successfully")
                    
                    # Try adding user to group again
                    cognito_client.admin_add_user_to_group(
                        UserPoolId=USER_POOL_ID,
                        Username=email,
                        GroupName='Admin'
                    )
                    print(f"User {email} added to Admin group successfully")
                except ClientError as create_error:
                    print(f"Error creating Admin group or adding user: {str(create_error)}")
            else:
                print(f"Error adding user to Admin group: {str(e)}")
            # Continue even if adding to group fails
        
        # Create organization record in DynamoDB after successful verification
        try:
            table.put_item(
                Item={
                    'orgAlias': retrieved_company_name,
                    'entityId': 'organization',
                    'adminEmail': email,
                    'adminName': admin_name,
                    'userSub': user_sub,
                    'verified': True,
                    'createdAt': str(int(time.time()))
                },
                ConditionExpression='attribute_not_exists(orgAlias) AND attribute_not_exists(entityId)'
            )
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                print(f"Organization already exists: {retrieved_company_name}")
                # Organization already exists, just update verified status
                try:
                    table.update_item(
                        Key={
                            'orgAlias': retrieved_company_name,
                            'entityId': 'organization'
                        },
                        UpdateExpression='SET verified = :verified, adminEmail = :email, userSub = :sub',
                        ExpressionAttributeValues={
                            ':verified': True,
                            ':email': email,
                            ':sub': user_sub
                        }
                    )
                except Exception as update_error:
                    print(f"Error updating existing organization: {str(update_error)}")
            else:
                print(f"Error creating organization in DynamoDB: {str(e)}")
                raise e
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Email verified successfully. You can now login.'
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
