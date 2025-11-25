import boto3
import json
import os
from decimal import Decimal

# DynamoDB client
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ['TABLE_NAME']
table = dynamodb.Table(TABLE_NAME)

# Helper class to convert Decimal to int/float for JSON serialization
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Extract officeId and roomId from query params, path params, or body
        office_id = None
        room_id = None
        
        # Try query string parameters first
        if event.get('queryStringParameters'):
            office_id = event['queryStringParameters'].get('officeId')
            room_id = event['queryStringParameters'].get('roomId')
        
        # Try path parameters
        if not office_id and event.get('pathParameters'):
            office_id = event['pathParameters'].get('officeId')
            room_id = event['pathParameters'].get('roomId')
        
        # Try body as fallback
        if (not office_id or not room_id) and event.get('body'):
            body = json.loads(event['body'])
            office_id = office_id or body.get('officeId')
            room_id = room_id or body.get('roomId')
        
        # Validate required parameters
        if not office_id or not room_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Missing required parameters: officeId and roomId'
                })
            }
        
        # Get item from DynamoDB
        print(f"Getting config for officeId={office_id}, roomId={room_id}")
        response = table.get_item(
            Key={
                'roomId': room_id,
                'officeId': office_id
            }
        )
        
        # Check if item exists
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Room configuration not found'
                })
            }
        
        # Return the room configuration
        room_config = response['Item']
        print(f"Room config found: {room_config}")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(room_config, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }
