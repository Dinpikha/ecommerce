from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies import get_current_user
from models import User, CartItem, Product
from schemas import CartItemCreate, CartItemUpdate, CartItemOut, CartOut

router = APIRouter(prefix="/cart", tags=["Cart"])


def _build_cart_out(db: Session, user_id: int) -> CartOut:
    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == user_id)
        .all()
    )

    item_outs = []
    subtotal = Decimal("0")
    total_items = 0

    for item in items:
        line_total = item.product.price * item.quantity
        subtotal += line_total
        total_items += item.quantity
        item_outs.append(
            CartItemOut(
                id=item.id,
                product=item.product,
                quantity=item.quantity,
                line_total=line_total,
                variant_color=item.variant_color or "",
            )
        )

    return CartOut(items=item_outs, subtotal=subtotal, total_items=total_items)


@router.get("", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _build_cart_out(db, current_user.id)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    variant_color = (payload.variant_color or "").strip()

    existing = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == payload.product_id,
            CartItem.variant_color == variant_color,
        )
        .first()
    )

    if existing:
        # already in cart -> increase quantity instead of creating a duplicate row
        existing.quantity += payload.quantity
    else:
        db.add(
            CartItem(
                user_id=current_user.id,
                product_id=payload.product_id,
                quantity=payload.quantity,
                variant_color=variant_color,
            )
        )

    db.commit()
    return _build_cart_out(db, current_user.id)


@router.patch("/items/{item_id}", response_model=CartOut)
def update_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    item.quantity = payload.quantity
    db.commit()
    return _build_cart_out(db, current_user.id)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return _build_cart_out(db, current_user.id)
