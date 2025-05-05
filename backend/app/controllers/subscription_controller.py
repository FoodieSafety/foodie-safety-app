from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from ..services.subscription_service import SubscriptionService
from ..util.schemas import SubscriptionCreate, SubscriptionResponse, TokenData
from ..dao.subscription_dao import SubscriptionDao

class SubscriptionController:
    """
    Controller for CRUD operations on Subscription object
    and passing response from model to view
    """
    
    @staticmethod
    def create_subscription(subscription: SubscriptionCreate, db: Session, token_data: TokenData) -> SubscriptionResponse:
        """
        Handles the creation of a new subscription.
        It delegates the actual creation to the service, which calls the DAO.
        """
        user_id = token_data.user_id
        return SubscriptionService.create_subscription(subscription, db, user_id)

    @staticmethod
    def update_subscription(subscription: SubscriptionCreate, db: Session, subscription_id: int, token_data: TokenData) -> Optional[SubscriptionResponse]:
        """
        Handles the updating of an existing subscription.
        It delegates the update operation to the service, which calls the DAO.
        """
        user_id = token_data.user_id
        return SubscriptionService.update_subscription(subscription, db, subscription_id, user_id)

    @staticmethod
    def get_subscriptions(db: Session, token_data: TokenData) -> List[SubscriptionResponse]:
        """
        Retrieves all subscriptions for the user.
        """
        user_id = token_data.user_id 
        subscriptions = SubscriptionDao.get_all_subscriptions(db)
        return [SubscriptionController._to_schema(sub) for sub in subscriptions if sub.user_id == user_id]

    @staticmethod
    def get_subscription(db: Session, subscription_id: int, token_data: TokenData) -> Optional[SubscriptionResponse]:
        """
        Retrieves a specific subscription by ID.
        Verifies that the user_id matches.
        """
        user_id = token_data.user_id
        subscription = SubscriptionDao.get_subscription_by_id(subscription_id, db)
        if subscription and subscription.user_id == user_id:
            return SubscriptionController._to_schema(subscription)
        return None
    
    @staticmethod
    def _to_schema(sub) -> SubscriptionResponse:
        """
        Converts the Subscription object to a SubscriptionResponse schema.
        """
        return SubscriptionResponse(
            subscription_id=sub.subscription_id,
            user_id=sub.user_id,
            state=sub.state,
            email=sub.user.email,
            zip_code=sub.user.zip_code,
            subscription_type=sub.subscription_type,
            status=sub.status,
            subscribed_at=sub.subscribed_at
        )