"""
Pydantic schemas — single file, one section per domain.

Naming convention:
  <Thing>Create  -> request body for creating
  <Thing>Update  -> request body for updating
  <Thing>Out     -> response shape returned to the frontend
"""
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, EmailStr, ConfigDict, Field


# ---------------------------------------------------------------------------
# Auth / Users
# ---------------------------------------------------------------------------

class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    price: Decimal
    category: str
    image_url: str | None = None
    stock: int
    rating: Decimal | None = None


class ProductListOut(BaseModel):
    total: int
    skip: int
    limit: int
    products: list[ProductOut]


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)
    variant_color: str = Field(default="", max_length=50)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product: ProductOut
    quantity: int
    line_total: Decimal
    variant_color: str = ""


class CartOut(BaseModel):
    items: list[CartItemOut]
    subtotal: Decimal
    total_items: int


# ---------------------------------------------------------------------------
# Wishlist
# ---------------------------------------------------------------------------

class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product: ProductOut


class WishlistOut(BaseModel):
    items: list[WishlistItemOut]


# ---------------------------------------------------------------------------
# Orders / Checkout
# ---------------------------------------------------------------------------

PaymentMethod = Literal["CARD", "UPI", "NETBANKING", "WALLET"]


class CheckoutRequest(BaseModel):
    customer_name: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=1, max_length=20)
    address_line: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pincode: str = Field(min_length=1, max_length=20)
    payment_method: PaymentMethod


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal
    variant_color: str | None = None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    payment_method: str
    payment_status: str
    order_status: str
    transaction_ref: str
    created_at: datetime
    items: list[OrderItemOut]


class OrderSummaryOut(BaseModel):
    """Lighter-weight shape for the order history list (GET /orders)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    total: Decimal
    payment_status: str
    order_status: str
    transaction_ref: str
    created_at: datetime
    item_count: int


class ReceiptOut(BaseModel):
    """Everything the frontend needs to render/print a receipt."""
    order_id: int
    transaction_ref: str
    customer_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    items: list[OrderItemOut]
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    payment_method: str
    payment_status: str
    order_status: str
    order_date: datetime
