import boto3
import json
import os

# Create client and handler
dynamodb = boto3.resource('dynamodb')
cognito_client = boto3.client('cognito-idp')

# Get environment variables
TABLE_NAME = os.environ.get('TABLE_NAME')
USER_POOL_ID = os.environ.get('USER_POOL_ID')

table = dynamodb.Table(TABLE_NAME)

def build_update_params(updates):
    update_expression = "SET "
    expression_names = {}
    expression_values = {}
    
    # Use #name and #email to avoid reserved words
    attribute_map = {
        "name": "#name",
        "email": "#email",
    }
    
    for key, value in updates.items():
        if key in attribute_map:
            placeholder = f":{key}"
            attr_name = attribute_map[key]
            
            update_expression += f"{attr_name} = {placeholder}, "
            expression_values[placeholder] = value
            expression_names[attr_name] = key

    update_expression = update_expression.rstrip(", ")

    return update_expression, expression_names, expression_values

def lambda_handler(event, context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        if "body" in event:
            body = json.loads(event["body"])
        else:
            body = event
                        
        user_id = body.get('userId')
        updates = body.get('updates') 

        if not user_id or not updates:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Lỗi: Thiếu "userId" hoặc "updates"'})
            }

        update_expr, attr_names, attr_values = build_update_params(updates)

        if not attr_values:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Không có trường hợp lệ nào để cập nhật'})
            }

        dynamo_response = table.update_item(
            Key={'userId': user_id},
            UpdateExpression=update_expr,
            ExpressionAttributeNames=attr_names,
            ExpressionAttributeValues=attr_values,
            ReturnValues="UPDATED_NEW"
        )

        if 'email' in updates:
            new_email = updates['email']
            try:
                cognito_client.admin_update_user_attributes(
                    UserPoolId=USER_POOL_ID,
                    Username=user_id, 
                    UserAttributes=[
                        {
                            'Name': 'email',
                            'Value': new_email
                        },
                        {
                            'Name': 'email_verified',
                            'Value': 'true'
                        }
                    ]
                )
            except Exception as e:
                print(f"Cognito Error: {e}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': f'Update DynamoDB success, but failed to update Cognito: {str(e)}'})
                }

        success_body = {
            "message": "Update success",
            "updatedAttributes": dynamo_response.get('Attributes')
        }
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(success_body)
        }

    except Exception as e:
        print(f"Unknown error: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Error when handle request: {str(e)}'})
        }