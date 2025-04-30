from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..util.models import Subscription, User
from ..util.schemas import SubscriptionCreate

class SubscriptionDao:
    @staticmethod
    def create_subscription(subscription: SubscriptionCreate, db: Session, user_id: int) -> Subscription:
        # Validate user exists
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} not found"
            )

        # Hybrid email check: only allow the user's own email (for now)
        if subscription.email and subscription.email != user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can only subscribe with your registered account email."
            )

        # Use provided or fallback values
        email = subscription.email or user.email
        zip_code = subscription.zip_code or user.zip_code
        state = subscription.state
        subscription_type = subscription.subscription_type

        # Check for existing identical subscription
        existing = db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.email == email,
            Subscription.zip_code == zip_code,
            Subscription.state == state,
            Subscription.subscription_type == subscription_type
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An identical subscription already exists."
            )

        # Create a new subscription
        new_subscription = Subscription(
            user_id=user_id,
            email=email,
            zip_code=zip_code,
            state=state,
            subscription_type=subscription_type,
            status=subscription.status
        )
        db.add(new_subscription)
        db.commit()
        db.refresh(new_subscription)
        return new_subscription

    @staticmethod
    def update_subscription(subscription: SubscriptionCreate, db: Session, subscription_id: int, user_id: int) -> Optional[Subscription]:
        subscription_to_update = db.query(Subscription).filter(
            Subscription.subscription_id == subscription_id,
            Subscription.user_id == user_id
        ).first()

        if not subscription_to_update:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized to update this subscription"
            )

        # Hybrid email check: only allow the user's own email (for now)
        user = db.query(User).filter(User.user_id == user_id).first()
        if subscription.email and subscription.email != user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can only update to your registered account email."
            )

        # Apply updates if values are provided
        if subscription.email:
            subscription_to_update.email = subscription.email

        if subscription.zip_code:
            subscription_to_update.zip_code = subscription.zip_code

        subscription_to_update.state = subscription.state
        subscription_to_update.subscription_type = subscription.subscription_type
        subscription_to_update.status = subscription.status

        db.commit()
        db.refresh(subscription_to_update)
        return subscription_to_update

    @staticmethod
    def get_all_subscriptions(db: Session) -> List[Subscription]:
        return db.query(Subscription).all()

    @staticmethod
    def get_subscription_by_id(subscription_id: int, db: Session) -> Optional[Subscription]:
        return db.query(Subscription).filter(Subscription.subscription_id == subscription_id).first()