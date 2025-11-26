import boto3
import json
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
USER_TABLE_NAME = os.environ['USER_TABLE_NAME']
user_table = dynamodb.Table(USER_TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        query_params = event.get('queryStringParameters') or {}
        company_id = query_params.get('companyId')
        
        if not company_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing companyId parameter'})
            }
        
        response = user_table.scan(
            FilterExpression='companyId = :cid',
            ExpressionAttributeValues={
                ':cid': company_id
            }
        )
        
        users = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'companyId': company_id,
                'userCount': len(users),
                'users': users
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error', 'message': str(e)})
        }
