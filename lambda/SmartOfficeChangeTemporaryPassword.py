import boto3
import json
import os

# Config
COGNITO_CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')

cognito_client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    """
    Handle NEW_PASSWORD_REQUIRED challenge from Cognito
    Used when user logs in for the first time with temporary password
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        username = body.get('username')
        new_password = body.get('newPassword')
        session = body.get('session')
        
        if not all([username, new_password, session]):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Username, newPassword, and session are required'})
            }
        
        # Respond to NEW_PASSWORD_REQUIRED challenge
        response = cognito_client.respond_to_auth_challenge(
            ClientId=COGNITO_CLIENT_ID,
            ChallengeName='NEW_PASSWORD_REQUIRED',
            Session=session,
            ChallengeResponses={
                'USERNAME': username,
                'NEW_PASSWORD': new_password
            }
        )
        
        # Get tokens from successful password change
        auth_result = response.get('AuthenticationResult', {})
        
        if 'AccessToken' not in auth_result:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': 'Failed to complete password change'})
            }
        
        access_token = auth_result.get('AccessToken')
        id_token = auth_result.get('IdToken')
        refresh_token = auth_result.get('RefreshToken')
        
        # Get user info
        user_info = cognito_client.get_user(AccessToken=access_token)
        user_attributes = {attr['Name']: attr['Value'] for attr in user_info.get('UserAttributes', [])}
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Password changed successfully',
                'access_token': access_token,
                'id_token': id_token,
                'refresh_token': refresh_token,
                'user': {
                    'userId': user_attributes.get('sub'),
                    'email': user_attributes.get('email'),
                    'name': user_attributes.get('name', '')
                }
            })
        }
        
    except cognito_client.exceptions.InvalidPasswordException as e:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'message': 'Password does not meet requirements'})
        }
    except cognito_client.exceptions.NotAuthorizedException as e:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'message': 'Invalid session or credentials'})
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': str(e)})
        }
