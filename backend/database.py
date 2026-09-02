"""
SQLAlchemy engine + session setup.

Everything downstream (models.py, routers) imports `Base` to define models
and `get_db` as a FastAPI dependency to get a request-scoped DB session.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from config import settings


def _normalize_database_url(url: str) -> str:
    """Use psycopg v3 (installed in requirements.txt) when URL omits the driver."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    return url


engine = create_engine(
    _normalize_database_url(settings.DATABASE_URL),
    pool_pre_ping=True,  # reconnect if the database closed an idle connection
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yields a DB session and always closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def apply_schema_updates() -> None:
    """Lightweight additive schema updates for existing databases."""
    from sqlalchemy import text

    statements = [
        "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS variant_color VARCHAR(50) NOT NULL DEFAULT ''",
        "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_color VARCHAR(50)",
        "ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS uq_cart_user_product",
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'uq_cart_user_product_variant'
            ) THEN
                ALTER TABLE cart_items
                ADD CONSTRAINT uq_cart_user_product_variant
                UNIQUE (user_id, product_id, variant_color);
            END IF;
        END $$;
        """,
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
