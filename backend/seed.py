"""
One-time seed script: imports products from the DummyJSON public API
into our own PostgreSQL `products` table (Supabase).

Run manually whenever you want to (re-)populate product data:
    python seed.py

Architecture (runtime):
    DummyJSON  -->  seed.py (one-time)  -->  PostgreSQL  -->  FastAPI  -->  React

Important:
- This script is NEVER imported or called by the running FastAPI app.
- The frontend must never call DummyJSON; it only uses GET /products.
- Idempotent: re-running skips any product whose external_id already exists.

Field mapping (DummyJSON -> products table):
    id          -> external_id
    title       -> name
    description -> description
    price       -> price
    category    -> category
    thumbnail   -> image_url
    stock       -> stock
    rating      -> rating
"""
import sys

import requests
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Product

DUMMYJSON_URL = "https://dummyjson.com/products"
SEED_LIMIT = 10000 # how many products to pull from DummyJSON


def fetch_dummyjson_products(limit: int = SEED_LIMIT) -> list[dict]:
    response = requests.get(DUMMYJSON_URL, params={"limit": limit}, timeout=15)
    response.raise_for_status()
    data = response.json()
    return data.get("products", [])


def map_dummyjson_product(item: dict) -> dict | None:
    """Map a DummyJSON product dict to our Product column values."""
    external_id = item.get("id")
    if external_id is None:
        return None

    return {
        "external_id": external_id,
        "name": item.get("title") or "Untitled Product",
        "description": item.get("description") or "",
        "price": item.get("price", 0),
        "category": item.get("category") or "uncategorized",
        "image_url": item.get("thumbnail") or "",
        "stock": item.get("stock", 0),
        "rating": item.get("rating"),
    }


def seed_products(db: Session, raw_products: list[dict]) -> tuple[int, int]:
    inserted = 0
    skipped = 0

    existing_external_ids = {
        row[0] for row in db.query(Product.external_id).filter(Product.external_id.isnot(None)).all()
    }

    for item in raw_products:
        mapped = map_dummyjson_product(item)
        if mapped is None:
            skipped += 1
            continue

        external_id = mapped["external_id"]
        if external_id in existing_external_ids:
            skipped += 1
            continue

        db.add(Product(**mapped))
        existing_external_ids.add(external_id)
        inserted += 1

    db.commit()
    return inserted, skipped


def verify_seeded_products(db: Session) -> None:
    total = db.query(Product).count()
    with_images = db.query(Product).filter(Product.image_url.isnot(None), Product.image_url != "").count()
    sample = db.query(Product).order_by(Product.id).first()

    print(f"Verification: {total} products in database, {with_images} with image_url.")
    if sample:
        print(
            f"Sample product: id={sample.id}, external_id={sample.external_id}, "
            f"name={sample.name!r}, image_url={sample.image_url!r}"
        )


def main():
    Base.metadata.create_all(bind=engine)

    print(f"Fetching up to {SEED_LIMIT} products from {DUMMYJSON_URL} ...")
    try:
        raw_products = fetch_dummyjson_products()
    except requests.RequestException as exc:
        print(f"ERROR: could not reach DummyJSON ({exc}).")
        print("Seeding aborted. The running FastAPI app is unaffected by this failure.")
        sys.exit(1)

    print(f"Fetched {len(raw_products)} products. Inserting into PostgreSQL (skipping duplicates)...")

    db = SessionLocal()
    try:
        inserted, skipped = seed_products(db, raw_products)
        verify_seeded_products(db)
    finally:
        db.close()

    print(f"Done. Inserted: {inserted}, Skipped (already existed): {skipped}")


if __name__ == "__main__":
    main()
