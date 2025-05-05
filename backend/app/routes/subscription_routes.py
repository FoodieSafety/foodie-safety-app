from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..util.oauth2 import get_current_user
from ..util.schemas import SubscriptionCreate, SubscriptionResponse
from ..util.database import get_db
from ..controllers.subscription_controller import SubscriptionController

router = APIRouter()

@router.post("/subscriptions", response_model=SubscriptionResponse)
async def create_subscription(
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_user)
):
    return SubscriptionController.create_subscription(subscription, db, token_data)

@router.put("/subscriptions/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: int,
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_user)
):
    return SubscriptionController.update_subscription(subscription, db, subscription_id, token_data)

@router.get("/subscriptions", response_model=List[SubscriptionResponse])
async def get_subscriptions(
    db: Session = Depends(get_db),
    token_data = Depends(get_current_user)
):
    return SubscriptionController.get_subscriptions(db, token_data)

@router.get("/subscriptions/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_user)
):
    return SubscriptionController.get_subscription(db, subscription_id, token_data)