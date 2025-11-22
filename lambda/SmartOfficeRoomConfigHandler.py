import boto3
import os
import json
from datetime import datetime, timezone
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            else:
                return float(obj)
        return super(DecimalEncoder, self).default(obj)

# Create client
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

# List of field to update
ALLOWED_UPDATE_FIELDS = [
    "temperatureMode",
    "humidityMode",
    "lightMode",
    "targetTemperature",
    "targetHumidity",
    "targetLight",
    "autoOnTime",
    "autoOffTime"
]

def lambda_handler(event, context):
    try:
        if "body" in event:
            body = json.loads(event["body"])
        else:
            body = event
        
        office_id = body.get('officeId')
        room_id = body.get('roomId')
        updates = body.get('updates')

        if not office_id or not room_id or not updates:
            return {'statusCode': 400, 'body': 'Error: Missing "officeId", "roomId", or "updates"'}

        update_expression = "SET "
        expression_names = {}
        expression_values = {}

        valid_updates = False
        for key, value in updates.items():
            if key in ALLOWED_UPDATE_FIELDS:
                valid_updates = True
                placeholder_name = f"#{key}" 
                placeholder_value = f":{key}"
                
                update_expression += f"{placeholder_name} = {placeholder_value}, "
                expression_names[placeholder_name] = key
                expression_values[placeholder_value] = value

        if not valid_updates:
            return {'statusCode': 400, 'body': 'No valid field in "updates"'}

        # Auto add lastUpdate field
        current_time_iso = datetime.now(timezone.utc).isoformat()
        
        update_expression += "#lastUpdate = :lastUpdate"
        expression_names["#lastUpdate"] = "lastUpdate"
        expression_values[":lastUpdate"] = current_time_iso

        key_to_update = {
            'officeId': office_id,
            'roomId': room_id
        }

        response = table.update_item(
            Key=key_to_update,
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_names,
            ExpressionAttributeValues=expression_values,
            ReturnValues="UPDATED_NEW"
        )

        success_body = {
            "message": "Room config update successfully",
            "updatedAttributes": response.get('Attributes')
        }
        return {
            'statusCode': 200,
            'body': json.dumps(success_body, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Lỗi: {e}")
        if "ConditionalCheckFailedException" in str(e):
             return {'statusCode': 404, 'body': 'No room found with given officeId and roomId'}
        
        return {
            'statusCode': 500,
            'body': f'Error while handling: {str(e)}'
        }
