import boto3
import json
import os
from decimal import Decimal
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ.get('SENSOR_LOG_TABLE')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

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
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        # Lấy tham số từ URL
        params = event.get('queryStringParameters') or {}
        room_id = params.get('roomId')  # Input bây giờ là roomId
        limit = int(params.get('limit', 50)) 

        if not room_id:
            return {
                'statusCode': 400, 
                'headers': headers, 
                'body': json.dumps({'message': 'Missing required parameter: roomId'})
            }

        # Query DynamoDB
        # PK = roomId, SK tự động được dùng để sort
        response = table.query(
            KeyConditionExpression=Key('roomId').eq(room_id), # Query đúng PK
            ScanIndexForward=False, # Lấy mới nhất trước (giảm dần theo timestamp)
            Limit=limit
        )

        items = response.get('Items', [])
        
        # Đảo ngược lại để Chart vẽ từ quá khứ -> hiện tại
        items.reverse()

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'roomId': room_id,
                'data_count': len(items),
                'data': items
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'message': str(e)})}