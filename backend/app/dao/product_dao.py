from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from fastapi import HTTPException, status
from ..util.schemas import ProductInfo
from ..util.models import Base, Product, User
from ..util.database import engine
from ..util.hash import hash_password

# Bind engine to metadata and create all tables
Base.metadata.create_all(bind=engine)

class ProductDao:
    """
    Talk to the database and perform CRUD operations on Product object
    and return the response to the controller
    """
    @staticmethod
    def upload_products(products: List[ProductInfo], db: Session, user_id: int) -> List[ProductInfo]:
        """
        Add products to user entry in the database
        :param products: Product list to upload
        :param db: Session object
        :param user_id: User id
        :return: response
        """

        # Check ID exists
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {user_id} not found")

        # Report uploaded products
        stored_products: List[ProductInfo] = []
        for product in products:
            # Check duplication in username or email
            existing_product = db.query(Product).filter(
                or_(
                    Product.code == product.code
                )
            ).first()

            if existing_product:
                # Check existing_products list of associated users
                # If user has already uploaded product do nothing else add user to product and product to user
                db.refresh(existing_product)
                user.products.append(existing_product)
            else:
                # Add product to db and associate to user
                new_product = Product(**product.model_dump())
                db.add(new_product)
                user.products.append(new_product)

            db.commit()
            # valid user, create
            stored_products.append(product)
        
        return stored_products
    
    @staticmethod
    def get_products(db: Session, user_id: int) -> List[ProductInfo]:
        """
        Get products associated to user
        :param db: Session object
        :param user_id: User id
        :return: response
        """

        # Check ID exists
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {user_id} not found")
        
        return [ProductInfo(**product.__dict__) for product in user.products]