import json
from typing import Optional
import boto3
from sqlalchemy.orm import Session
from app.dao.subscription_dao import SubscriptionDao
from ..util.schemas import SubscriptionCreate, SubscriptionResponse
from ..util.transformers import subscription_to_schema

lambda_client = boto3.client('lambda', region_name='us-west-1')

class SubscriptionService:

    @staticmethod
    def create_subscription(subscription: SubscriptionCreate, db: Session, user_id: int) -> SubscriptionResponse:
        new_subscription = SubscriptionDao.create_subscription(subscription, db, user_id)
        SubscriptionService.invoke_lambda(
            new_subscription.email,
            new_subscription.status,
            new_subscription.subscription_type
        )

        return subscription_to_schema(new_subscription)

    @staticmethod
    def update_subscription(subscription: SubscriptionCreate, db: Session, subscription_id: int, user_id: int) -> Optional[SubscriptionResponse]:
        updated_subscription = SubscriptionDao.update_subscription(subscription, db, subscription_id, user_id)

        if updated_subscription:
            SubscriptionService.invoke_lambda(
                updated_subscription.email,
                updated_subscription.status,
                updated_subscription.subscription_type
            )
            return subscription_to_schema(updated_subscription)

        return None

    @staticmethod
    def invoke_lambda(email: str, status: str, subscription_type: str):
        payload = {
            'email': email,
            'status': status,
            'subscription_type': subscription_type
        }
        try:
            response = lambda_client.invoke(
                FunctionName='subscription_lambda',
                InvocationType='Event',
                Payload=json.dumps(payload),
            )
            print(f"Lambda invoked: {response}")
        except Exception as e:
            print(f"Error invoking Lambda: {str(e)}")