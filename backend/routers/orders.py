import secrets
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from config import settings
from database import get_db
from dependencies import get_current_user
from models import User, CartItem, Order, OrderItem
from schemas import CheckoutRequest, OrderOut, OrderSummaryOut, ReceiptOut

router = APIRouter(prefix="/orders", tags=["Orders"])


def _generate_transaction_ref() -> str:
    # App-generated simulated transaction/reference id. Never a real payment gateway id.
    return f"TXN-{secrets.token_hex(5).upper()}"


def _round2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@router.post("/checkout", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Always read the cart fresh from the DB — never trust prices/quantities from the client.
    cart_items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    # Validate stock availability before committing anything.
    for item in cart_items:
        if item.quantity > item.product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{item.product.name}'. "
                f"Available: {item.product.stock}, requested: {item.quantity}",
            )

    subtotal = sum((item.product.price * item.quantity for item in cart_items), Decimal("0"))
    subtotal = _round2(Decimal(subtotal))
    tax = _round2(subtotal * Decimal(str(settings.TAX_RATE)))
    total = _round2(subtotal + tax)

    order = Order(
        user_id=current_user.id,
        customer_name=payload.customer_name,
        phone=payload.phone,
        address_line=payload.address_line,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        subtotal=subtotal,
        tax=tax,
        total=total,
        payment_method=payload.payment_method,
        payment_status="PAID",       # simulated payment — always succeeds
        order_status="CONFIRMED",
        transaction_ref=_generate_transaction_ref(),
    )
    db.add(order)
    db.flush()  # get order.id before adding order_items

    for item in cart_items:
        line_total = _round2(item.product.price * item.quantity)
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product.id,
                product_name=item.product.name,   # snapshot at time of purchase
                unit_price=item.product.price,     # snapshot at time of purchase
                quantity=item.quantity,
                line_total=line_total,
                variant_color=item.variant_color or None,
            )
        )
        item.product.stock -= item.quantity  # decrement stock

    # Clear the cart now that the order has been created successfully.
    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderSummaryOut])
def list_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [
        OrderSummaryOut(
            id=o.id,
            total=o.total,
            payment_status=o.payment_status,
            order_status=o.order_status,
            transaction_ref=o.transaction_ref,
            created_at=o.created_at,
            item_count=len(o.items),
        )
        for o in orders
    ]


def _get_owned_order(db: Session, order_id: int, user_id: int) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id, Order.user_id == user_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_owned_order(db, order_id, current_user.id)


@router.get("/{order_id}/receipt", response_model=ReceiptOut)
def get_receipt(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = _get_owned_order(db, order_id, current_user.id)
    return ReceiptOut(
        order_id=order.id,
        transaction_ref=order.transaction_ref,
        customer_name=order.customer_name,
        phone=order.phone,
        address_line=order.address_line,
        city=order.city,
        state=order.state,
        pincode=order.pincode,
        items=order.items,
        subtotal=order.subtotal,
        tax=order.tax,
        total=order.total,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        order_status=order.order_status,
        order_date=order.created_at,
    )
