from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import ProductOut, ProductListOut

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=ProductListOut)
def list_products(
    search: str | None = Query(default=None, description="Case-insensitive search on product name"),
    category: str | None = Query(default=None, description="Exact category filter, e.g. 'beauty'"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = select(Product)

    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if category:
        query = query.where(Product.category == category)

    total = db.scalar(select(func.count()).select_from(query.subquery()))

    query = query.offset(skip).limit(limit)
    products = db.scalars(query).all()

    return ProductListOut(total=total, skip=skip, limit=limit, products=products)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
