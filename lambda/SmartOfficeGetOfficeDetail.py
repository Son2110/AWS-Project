import boto3
import json
import os
from decimal import Decimal

# Config
OFFICE_TABLE = os.environ.get('OFFICE_TABLE')
MANAGER_TABLE = os.environ.get('MANAGER_TABLE')

dynamodb = boto3.resource('dynamodb')
office_table = dynamodb.Table(OFFICE_TABLE)
manager_table = dynamodb.Table(MANAGER_TABLE)

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
    Get office detail by orgAlias and officeId with manager information
    Join Office and Manager tables to get complete information
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        # Get parameters from query string
        query_params = event.get('queryStringParameters') or {}
        org_alias = query_params.get('orgAlias', '').strip()
        office_id = query_params.get('officeId', '').strip()
        
        if not org_alias or not office_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'orgAlias and officeId are required'})
            }
        
        # Get office by orgAlias (PK) and entityId (SK)
        # entityId format: OFFICE#{officeId}
        entity_id = f'OFFICE#{office_id}'
        
        office_response = office_table.get_item(
            Key={
                'orgAlias': org_alias,
                'entityId': entity_id
            }
        )
        
        office = office_response.get('Item')
        
        if not office:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'message': 'Office not found'})
            }
        
        # Query manager for this office
        manager_response = manager_table.query(
            KeyConditionExpression='orgAlias = :orgAlias',
            FilterExpression='assignedOfficeId = :officeId',
            ExpressionAttributeValues={
                ':orgAlias': org_alias,
                ':officeId': office_id
            }
        )
        
        managers = manager_response.get('Items', [])
        
        # Get manager info (should be only one manager per office)
        manager_info = None
        if managers:
            manager = managers[0]
            manager_info = {
                'userId': manager.get('userId'),
                'managerName': manager.get('name', 'N/A'),
                'managerEmail': manager.get('managerEmail', 'N/A'),
                'managerRole': manager.get('role', 'MANAGER'),
                'managerStatus': manager.get('status', 'ACTIVE'),
                'assignedAt': manager.get('createdAt')
            }
        
        # Build office detail response
        office_detail = {
            'officeId': office.get('officeId'),
            'name': office.get('name'),
            'address': office.get('address'),
            'createdAt': office.get('createdAt'),
            'orgAlias': office.get('orgAlias'),
            'entityId': office.get('entityId'),
            'manager': manager_info
        }
        
        # Convert Decimal to JSON serializable types
        office_detail = decimal_to_number(office_detail)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'office': office_detail
            })
        }
        
    except Exception as e:
        print(f"Error getting office detail: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': f'Failed to get office detail: {str(e)}'})
        }
