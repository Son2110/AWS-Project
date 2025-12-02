import boto3
import json
import os
import time
import uuid

# Config
OFFICE_TABLE = os.environ['OFFICE_TABLE']
MANAGER_TABLE = os.environ['MANAGER_TABLE']
USER_POOL_ID = os.environ.get('USER_POOL_ID') 

dynamodb = boto3.resource('dynamodb')
cognito_client = boto3.client('cognito-idp')
office_table = dynamodb.Table(OFFICE_TABLE)
manager_table = dynamodb.Table(MANAGER_TABLE)

def lambda_handler(event, context):
    headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Access-Control-Allow-Methods': 'POST,OPTIONS' }
    if event.get('httpMethod') == 'OPTIONS': return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))
        # Admin đang đăng nhập (lấy từ orgAlias của admin hoặc input)
        org_alias = body.get('orgAlias') 
        
        # Thông tin Office mới
        office_name = body.get('officeName')
        address = body.get('address')
        
        # Thông tin Manager mới
        manager_email = body.get('managerEmail')
        manager_name = body.get('managerName')

        if not all([org_alias, office_name, manager_email]):
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'Missing required fields'})}

        # 1. Tạo Office ID
        office_id = str(uuid.uuid4())
        timestamp = int(time.time())

        # 2. Kiểm tra xem manager email đã tồn tại trong Cognito chưa
        user_exists = False
        try:
            if USER_POOL_ID:
                # Check if user already exists
                try:
                    cognito_client.admin_get_user(
                        UserPoolId=USER_POOL_ID,
                        Username=manager_email
                    )
                    user_exists = True
                    print(f"User {manager_email} already exists in Cognito, skipping creation")
                except cognito_client.exceptions.UserNotFoundException:
                    user_exists = False
                
                # Nếu user chưa tồn tại → Tạo mới
                if not user_exists:
                    cognito_client.admin_create_user(
                        UserPoolId=USER_POOL_ID,
                        Username=manager_email,
                        UserAttributes=[
                            {'Name': 'email', 'Value': manager_email},
                            {'Name': 'name', 'Value': manager_name},
                            {'Name': 'email_verified', 'Value': 'true'}
                        ],
                        DesiredDeliveryMediums=['EMAIL']
                    )
                    print(f"Created new Cognito user: {manager_email}")
                
                # Add to Manager Group (auto-create group if not exists)
                try:
                    cognito_client.admin_add_user_to_group(
                        UserPoolId=USER_POOL_ID,
                        Username=manager_email,
                        GroupName='Manager'
                    )
                    print(f"Added {manager_email} to Manager group")
                except cognito_client.exceptions.ResourceNotFoundException:
                    # Group doesn't exist, create it
                    print("Manager group not found, creating it...")
                    try:
                        cognito_client.create_group(
                            UserPoolId=USER_POOL_ID,
                            GroupName='Manager',
                            Description='Manager role for office management',
                            Precedence=1
                        )
                        print("Manager group created successfully")
                        # Retry adding user to group
                        cognito_client.admin_add_user_to_group(
                            UserPoolId=USER_POOL_ID,
                            Username=manager_email,
                            GroupName='Manager'
                        )
                        print(f"Added {manager_email} to Manager group after creation")
                    except Exception as create_error:
                        print(f"Failed to create Manager group: {create_error}")
                except Exception as group_error:
                    # User có thể đã ở trong group rồi, bỏ qua
                    print(f"Group assignment info: {group_error}")
                    
        except Exception as e:
            print(f"Cognito Error: {e}")
            return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'message': f'Failed to process Cognito user: {str(e)}'})}

        # 3. Lưu vào DynamoDB (Office & Manager)
        # Lưu Office
        office_table.put_item(Item={
            'orgAlias': org_alias,
            'entityId': f'OFFICE#{office_id}',
            'officeId': office_id,
            'name': office_name,
            'address': address,
            'createdAt': timestamp
        })

        # Lưu Manager Profile
        # Note: Cho phép admin tự assign làm manager của office
        manager_id = str(uuid.uuid4())
        manager_table.put_item(Item={
            'orgAlias': org_alias,
            'userId': manager_id,  # Thêm userId làm SK
            'managerEmail': manager_email,  # Đổi từ 'email' thành 'managerEmail' để match với Login Lambda
            'name': manager_name,
            'role': 'MANAGER',
            'assignedOfficeId': office_id, # Link manager với office này
            'createdAt': timestamp,
            'status': 'ACTIVE'
        })

        return {
            'statusCode': 200, 
            'headers': headers, 
            'body': json.dumps({'message': 'Office and Manager created successfully', 'officeId': office_id})
        }

    except Exception as e:
        print(f"Error: {e}")
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'message': str(e)})}