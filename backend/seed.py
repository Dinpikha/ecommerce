"""
One-time seed script: imports ~40 products from the DummyJSON public API
into our own PostgreSQL `products` table.

Run manually, whenever you want to (re-)populate product data:
    python seed.py

Important:
- This script is NEVER imported or called by the running FastAPI app.
  DummyJSON is only a data source at seed time; once products are in PostgreSQL,
  the app works entirely offline from the database.
- Idempotent: re-running this script will NOT create duplicate products.
  Each DummyJSON product's `id` is stored in our `external_id` column, and
  we skip any product whose external_id already exists in our table.
"""
import sys

import requests
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Product

DUMMYJSON_URL = "https://dummyjson.com/products"
SEED_LIMIT = 40  # how many products to pull from DummyJSON


def fetch_dummyjson_products(limit: int = SEED_LIMIT) -> list[dict]:
    response = requests.get(DUMMYJSON_URL, params={"limit": limit}, timeout=15)
    response.raise_for_status()
    data = response.json()
    return data.get("products", [])


def seed_products(db: Session, raw_products: list[dict]) -> tuple[int, int]:
    inserted = 0
    skipped = 0

    # Preload existing external_ids in one query, avoiding N+1 lookups.
    existing_external_ids = {
        row[0] for row in db.query(Product.external_id).filter(Product.external_id.isnot(None)).all()
    }

    for item in raw_products:
        external_id = item.get("id")

        if external_id in existing_external_ids:
            skipped += 1
            continue

        product = Product(
            external_id=external_id,
            name=item.get("title", "Untitled Product"),
            description=item.get("description", ""),
            price=item.get("price", 0),
            category=item.get("category", "uncategorized"),
            image_url=item.get("thumbnail", ""),
            stock=item.get("stock", 0),
            rating=item.get("rating"),
        )
        db.add(product)
        inserted += 1

    db.commit()
    return inserted, skipped


def main():
    # Make sure tables exist before seeding (harmless if they already do).
    Base.metadata.create_all(bind=engine)

    print(f"Fetching up to {SEED_LIMIT} products from DummyJSON...")
    try:
        raw_products = fetch_dummyjson_products()
    except requests.RequestException as exc:
        print(f"ERROR: could not reach DummyJSON ({exc}).")
        print("Seeding aborted. The running FastAPI app is unaffected by this failure — "
              "it never depends on DummyJSON at runtime.")
        sys.exit(1)

    print(f"Fetched {len(raw_products)} products. Inserting into PostgreSQL (skipping duplicates)...")

    db = SessionLocal()
    try:
        inserted, skipped = seed_products(db, raw_products)
    finally:
        db.close()

    print(f"Done. Inserted: {inserted}, Skipped (already existed): {skipped}")


if __name__ == "__main__":
    main()
