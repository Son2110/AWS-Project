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
    List all offices by orgAlias with manager information
    Join Office and Manager tables to get complete information
    Only return items with officeId (exclude organization record)
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        # Get orgAlias from query parameters
        query_params = event.get('queryStringParameters') or {}
        org_alias = query_params.get('orgAlias', '').strip()
        
        if not org_alias:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'orgAlias is required'})
            }
        
        # Query all offices with this orgAlias
        office_response = office_table.query(
            KeyConditionExpression='orgAlias = :orgAlias',
            ExpressionAttributeValues={
                ':orgAlias': org_alias
            }
        )
        
        office_items = office_response.get('Items', [])
        
        # Filter out items that don't have officeId (exclude organization record)
        offices = [
            item for item in office_items 
            if item.get('officeId') and item.get('entityId', '').startswith('OFFICE#')
        ]
        
        # Query all managers with this orgAlias
        manager_response = manager_table.query(
            KeyConditionExpression='orgAlias = :orgAlias',
            ExpressionAttributeValues={
                ':orgAlias': org_alias
            }
        )
        
        managers = manager_response.get('Items', [])
        
        # Create a map of assignedOfficeId -> manager info
        manager_map = {}
        for manager in managers:
            assigned_office_id = manager.get('assignedOfficeId')
            if assigned_office_id:
                manager_map[assigned_office_id] = {
                    'managerName': manager.get('name', 'N/A'),
                    'managerEmail': manager.get('managerEmail', 'N/A'),
                    'managerRole': manager.get('role', 'MANAGER'),
                    'managerStatus': manager.get('status', 'ACTIVE')
                }
        
        # Join offices with manager information
        offices_with_managers = []
        for office in offices:
            office_id = office.get('officeId')
            manager_info = manager_map.get(office_id, {
                'managerName': 'N/A',
                'managerEmail': 'N/A',
                'managerRole': 'N/A',
                'managerStatus': 'N/A'
            })
            
            offices_with_managers.append({
                'officeId': office_id,
                'name': office.get('name'),
                'address': office.get('address'),
                'createdAt': office.get('createdAt'),
                'orgAlias': office.get('orgAlias'),
                'manager': manager_info
            })
        
        # Convert Decimal to JSON serializable types
        offices_with_managers = decimal_to_number(offices_with_managers)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'offices': offices_with_managers,
                'count': len(offices_with_managers)
            })
        }
        
    except Exception as e:
        print(f"Error listing offices with managers: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': f'Failed to list offices: {str(e)}'})
        }
