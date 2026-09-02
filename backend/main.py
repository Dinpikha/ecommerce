"""
FastAPI application entrypoint.

Run locally with:
    uvicorn main:app --reload

Swagger docs available at /docs, ReDoc at /redoc.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine, apply_schema_updates
import models  # noqa: F401  -- import ensures all models are registered with Base
from routers import auth as auth_router
from routers import products as products_router
from routers import cart as cart_router
from routers import wishlist as wishlist_router
from routers import orders as orders_router

# Creates tables that don't exist yet. Fine for a timed student project;
# a real production app would use Alembic migrations instead.
Base.metadata.create_all(bind=engine)
apply_schema_updates()

app = FastAPI(
    title="E-Commerce API",
    description="Backend API for the college e-commerce project. "
    "Provides auth, products, cart, wishlist, and order/checkout endpoints.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(products_router.router)
app.include_router(cart_router.router)
app.include_router(wishlist_router.router)
app.include_router(orders_router.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "E-Commerce API is running. Visit /docs for API docs."}
