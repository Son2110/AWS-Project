import boto3
import json
import os
import time

ROOM_CONFIG_TABLE = os.environ['ROOM_CONFIG_TABLE']
OFFICE_TABLE = os.environ.get('OFFICE_TABLE', 'Office')
iot_client = boto3.client('iot')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(ROOM_CONFIG_TABLE)

def lambda_handler(event, context):
    headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Access-Control-Allow-Methods': 'POST,OPTIONS' }
    if event.get('httpMethod') == 'OPTIONS': return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))
        office_id = body.get('officeId')
        room_id = body.get('roomId')
        org_alias = body.get('orgAlias')
        
        if not office_id or not room_id:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'Missing officeId or roomId'})}

        # 1. Get office name from Office table using orgAlias
        office_name = office_id  # Default fallback
        if org_alias:
            try:
                office_table = dynamodb.Table(OFFICE_TABLE)
                
                # Query Office table with OFFICE# prefix in entityId
                office_response = office_table.get_item(
                    Key={
                        'orgAlias': org_alias,
                        'entityId': f'OFFICE#{office_id}'
                    }
                )
                if 'Item' in office_response:
                    office_name = office_response['Item'].get('name', office_id)
                    # Remove spaces from office name for Thing name
                    office_name = office_name.replace(' ', '')
                    print(f"Found office name: {office_name}")
            except Exception as e:
                print(f"Warning: Could not fetch office name: {e}")
                # Continue with office_id as fallback

        # 2. Check if roomId already exists in the table
        try:
            response = table.get_item(
                Key={
                    'roomId': room_id,
                    'officeId': office_id
                }
            )
            if 'Item' in response:
                return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'message': f'Room {room_id} already exists in office {office_id}'})}
        except Exception as e:
            print(f"Error checking existing room: {e}")

        # 3. Tạo tên Thing duy nhất sử dụng office name
        thing_name = f"{office_name}_{room_id}"

        # 2. Tạo Thing trên AWS IoT Core
        try:
            iot_client.create_thing(thingName=thing_name)
        except iot_client.exceptions.ResourceAlreadyExistsException:
            pass # Thing đã có thì dùng lại

        # 3. Tạo Keys & Certificate
        cert_response = iot_client.create_keys_and_certificate(setAsActive=True)
        certificate_arn = cert_response['certificateArn']
        certificate_pem = cert_response['certificatePem']
        private_key = cert_response['keyPair']['PrivateKey']
        
        # 4. Attach Policy (Policy phải được tạo trước bằng Stack IoT Core)
        # Giả sử tên Policy là "SmartOfficeDevicePolicy" (đặt cứng hoặc lấy từ env)
        # Bạn có thể lấy policy name động nếu truyền qua biến môi trường
        policy_name = f"SmartOffice-DevicePolicy" # Lưu ý: Cần match với tên trong template IoT Core
        
        try:
            iot_client.attach_policy(policyName=policy_name, target=certificate_arn)
        except Exception as e:
            print(f"Warning attaching policy: {e}")

        # 5. Attach Thing to Certificate
        iot_client.attach_thing_principal(thingName=thing_name, principal=certificate_arn)

        # 6. Lưu vào DynamoDB (roomId = PK, officeId = SK)
        item = {
            'roomId': room_id,
            'officeId': office_id,
            'thingName': thing_name,
            'certificateArn': certificate_arn,
            'createdAt': int(time.time()),
            # Default config
            'temperatureMode': 'auto',
            'targetTemperature': 26,
            'humidityMode': 'auto',
            'targetHumidity': 60,
            'lightMode': 'auto',
            'targetLight': '300',
            'connectionStatus': 'OFFLINE'
        }
        table.put_item(Item=item)

        # 7. Trả về Certs để Manager nạp vào Hub (Quan trọng cho Option A)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Room created & IoT Thing registered',
                'thingName': thing_name,
                'certificatePem': certificate_pem,
                'privateKey': private_key,
                'rootCA': 'Download from AWS' 
            })
        }

    except Exception as e:
        print(f"Error: {e}")
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'message': str(e)})}