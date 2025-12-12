import boto3
import json
import os
from decimal import Decimal

# Config
OFFICE_TABLE = os.environ['OFFICE_TABLE']
MANAGER_TABLE = os.environ['MANAGER_TABLE']
USER_POOL_ID = os.environ.get('USER_POOL_ID')  # Optional for Cognito deletion

dynamodb = boto3.resource('dynamodb')
cognito_client = boto3.client('cognito-idp')
office_table = dynamodb.Table(OFFICE_TABLE)
manager_table = dynamodb.Table(MANAGER_TABLE)

def is_admin_user(email):
    """Check if user is in Admin group in Cognito"""
    if not USER_POOL_ID or not email:
        return False
    
    try:
        response = cognito_client.admin_list_groups_for_user(
            UserPoolId=USER_POOL_ID,
            Username=email
        )
        groups = [group['GroupName'] for group in response.get('Groups', [])]
        return 'Admin' in groups
    except Exception as e:
        print(f"Error checking user groups: {e}")
        return False

def lambda_handler(event, context):
    """
    Delete Office or Manager
    Actions: DELETE_OFFICE, DELETE_MANAGER
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        org_alias = body.get('orgAlias')

        if not action or not org_alias:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Missing action or orgAlias'})
            }

        if action == 'DELETE_OFFICE':
            office_id = body.get('officeId')
            
            if not office_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Missing officeId'})
                }
            
            # Check if office exists
            entity_id = f'OFFICE#{office_id}'
            office_response = office_table.get_item(
                Key={'orgAlias': org_alias, 'entityId': entity_id}
            )
            
            if 'Item' not in office_response:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'message': 'Office not found'})
                }
            
            # Find and delete manager assigned to this office
            manager_response = manager_table.query(
                KeyConditionExpression='orgAlias = :orgAlias',
                FilterExpression='assignedOfficeId = :officeId',
                ExpressionAttributeValues={
                    ':orgAlias': org_alias,
                    ':officeId': office_id
                }
            )
            
            managers = manager_response.get('Items', [])
            
            if managers:
                manager = managers[0]
                manager_user_id = manager.get('userId')
                manager_email = manager.get('managerEmail')
                
                # Delete from Manager table
                manager_table.delete_item(
                    Key={'orgAlias': org_alias, 'userId': manager_user_id}
                )
                print(f"Deleted manager {manager_user_id} from Manager table")
                
                if USER_POOL_ID and manager_email:
                    # Remove from Manager group
                    try:
                        cognito_client.admin_remove_user_from_group(
                            UserPoolId=USER_POOL_ID,
                            Username=manager_email,
                            GroupName='Manager'
                        )
                        print(f"Removed {manager_email} from Manager group")
                    except Exception as e:
                        print(f"Failed to remove from Manager group: {e}")
                    
                    # Delete user from Cognito only if NOT in Admin group
                    if not is_admin_user(manager_email):
                        try:
                            cognito_client.admin_delete_user(
                                UserPoolId=USER_POOL_ID,
                                Username=manager_email
                            )
                            print(f"Deleted Cognito user: {manager_email}")
                        except cognito_client.exceptions.UserNotFoundException:
                            print(f"Cognito user not found: {manager_email}")
                        except Exception as e:
                            print(f"Failed to delete Cognito user: {e}")
                    else:
                        print(f"Skipped Cognito user deletion for admin: {manager_email}")
            
            # Delete office
            office_table.delete_item(
                Key={'orgAlias': org_alias, 'entityId': entity_id}
            )
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Office and manager deleted successfully'})
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Invalid action. Must be DELETE_OFFICE'})
            }

    except Exception as e:
        print(f"Error deleting: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': f'Failed to delete: {str(e)}'})
        }
