import boto3
import json
import os
from decimal import Decimal

# Config
OFFICE_TABLE = os.environ['OFFICE_TABLE']
MANAGER_TABLE = os.environ['MANAGER_TABLE']

dynamodb = boto3.resource('dynamodb')
office_table = dynamodb.Table(OFFICE_TABLE)
manager_table = dynamodb.Table(MANAGER_TABLE)

# Allowed fields to update
OFFICE_ALLOWED_FIELDS = {'name', 'address'}
MANAGER_ALLOWED_FIELDS = {'name', 'status'}

# Helper function to convert DynamoDB Decimal to JSON serializable types
def decimal_to_number(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_number(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_number(i) for i in obj]
    return obj

def lambda_handler(event, context):
    """
    Update Office or Manager information
    Target: OFFICE or MANAGER
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))
        target = body.get('target')  # "OFFICE" or "MANAGER"
        org_alias = body.get('orgAlias')
        updates = body.get('updates', {})  # Dict of fields to update

        if not target or not org_alias or not updates:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Missing target, orgAlias or updates'})
            }

        # Validate target
        if target not in ['OFFICE', 'MANAGER']:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Invalid target. Must be OFFICE or MANAGER'})
            }

        # Filter allowed fields
        allowed_fields = OFFICE_ALLOWED_FIELDS if target == 'OFFICE' else MANAGER_ALLOWED_FIELDS
        filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}
        
        if not filtered_updates:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': f'No valid fields to update. Allowed: {list(allowed_fields)}'})
            }

        # Build update expression
        update_expression = "SET "
        expression_values = {}
        expression_names = {}

        for key, value in filtered_updates.items():
            update_expression += f"#{key} = :{key}, "
            expression_values[f":{key}"] = value
            expression_names[f"#{key}"] = key
        
        update_expression = update_expression.rstrip(", ")

        if target == "OFFICE":
            office_id = body.get('officeId')
            if not office_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Missing officeId for Office update'})
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
            
            # Update office
            office_table.update_item(
                Key={'orgAlias': org_alias, 'entityId': entity_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ExpressionAttributeNames=expression_names
            )
            
            message = f'Office {office_id} updated successfully'

        elif target == "MANAGER":
            user_id = body.get('userId')
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Missing userId for Manager update'})
                }

            # Check if manager exists
            manager_response = manager_table.get_item(
                Key={'orgAlias': org_alias, 'userId': user_id}
            )
            
            if 'Item' not in manager_response:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'message': 'Manager not found'})
                }
            
            # Update manager
            manager_table.update_item(
                Key={'orgAlias': org_alias, 'userId': user_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ExpressionAttributeNames=expression_names
            )
            
            message = f'Manager {user_id} updated successfully'

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': message,
                'updatedFields': list(filtered_updates.keys())
            })
        }

    except Exception as e:
        print(f"Error updating {target}: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': f'Failed to update: {str(e)}'})
        }
