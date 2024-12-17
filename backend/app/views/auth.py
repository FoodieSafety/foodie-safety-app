from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.util.database import get_db
from backend.app.util.schemas import UserLogin
from backend.app.util.models import User
from backend.app.util.hash import verify_password
router = APIRouter(tags=["Authentication"])

@router.post("/login", status_code=status.HTTP_200_OK)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    User login
    :param user_credentials: user credentials to login
    :param db: session object
    :return: response
    """
    # Check valid username and email
    user = db.query(User).filter(
        or_(
            User.username == user_credentials.username,
            User.email == user_credentials.email
        )
    ).first()

    # Validate username, email and password simultaneously
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid login credentials")

    # Check password
    if not verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid login credentials")

    # Create JWT token
    token = "some-jwt-token"

    return {
        "message": "success",
        "token": token
    }