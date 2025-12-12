import boto3
import json
import os
from decimal import Decimal
from boto3.dynamodb.conditions import Key # <--- THÊM IMPORT NÀY

# DynamoDB client
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ['ROOM_CONFIG_TABLE']
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
        # Extract officeId from query params, path params, or body
        office_id = None
        
        # Try query string parameters first
        if event.get('queryStringParameters'):
            office_id = event['queryStringParameters'].get('officeId')
        
        # Try path parameters
        if not office_id and event.get('pathParameters'):
            office_id = event['pathParameters'].get('officeId')
        
        # Try body as fallback
        if not office_id and event.get('body'):
            body = json.loads(event['body'])
            office_id = body.get('officeId')
        
        # Validate required parameter
        if not office_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Missing required parameter: officeId'
                })
            }
        
        # --- Use SCAN with FilterExpression since officeId is not the primary key ---
        print(f"Scanning table for officeId: {office_id}")
        response = table.scan(
            FilterExpression='officeId = :officeId',
            ExpressionAttributeValues={
                ':officeId': office_id
            }
        )
        print(f"Scan completed. Items found: {len(response.get('Items', []))}")
        
        # Extract items
        rooms = response.get('Items', [])
        
        # Return the list of rooms
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'officeId': office_id,
                'roomCount': len(rooms),
                'rooms': rooms
            }, cls=DecimalEncoder)
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