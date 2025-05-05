from app.util.schemas import SubscriptionResponse


def subscription_to_schema(sub) -> SubscriptionResponse:
    return SubscriptionResponse(
        subscription_id=sub.subscription_id,
        user_id=sub.user_id,
        state=sub.state,
        email=sub.user.email,
        zip_code=sub.user.zip_code,
        subscription_type=sub.subscription_type,
        status=sub.status,
        subscribed_at=sub.subscribed_at,
    )
