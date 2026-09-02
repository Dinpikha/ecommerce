from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies import get_current_user
from models import User, WishlistItem, Product
from schemas import WishlistOut

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=WishlistOut)
def get_wishlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = (
        db.query(WishlistItem)
        .options(joinedload(WishlistItem.product))
        .filter(WishlistItem.user_id == current_user.id)
        .all()
    )
    return WishlistOut(items=items)


@router.post("/{product_id}", response_model=WishlistOut, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not existing:
        db.add(WishlistItem(user_id=current_user.id, product_id=product_id))
        db.commit()

    items = (
        db.query(WishlistItem)
        .options(joinedload(WishlistItem.product))
        .filter(WishlistItem.user_id == current_user.id)
        .all()
    )
    return WishlistOut(items=items)


@router.delete("/{product_id}", response_model=WishlistOut)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in wishlist")

    db.delete(item)
    db.commit()

    items = (
        db.query(WishlistItem)
        .options(joinedload(WishlistItem.product))
        .filter(WishlistItem.user_id == current_user.id)
        .all()
    )
    return WishlistOut(items=items)
