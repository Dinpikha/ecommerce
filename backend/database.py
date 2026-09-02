"""
SQLAlchemy engine + session setup.

Everything downstream (models.py, routers) imports `Base` to define models
and `get_db` as a FastAPI dependency to get a request-scoped DB session.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from config import settings

engine = create_engine(
    settings.DATABASE_URL,
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
