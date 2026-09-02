# API Contract — E-Commerce Backend

This document is the single source of truth for integrating the React (Vite +
Tailwind) frontend — or an AI frontend generator like v0 — with this FastAPI
backend. All endpoints, request/response shapes, and error cases below are
implemented and tested exactly as written.

Interactive, always-current docs are also available at **`/docs`** (Swagger UI)
and **`/redoc`** once the backend is running.

---

## Base URL & environment variables

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Set this in the React app's `.env`. All endpoint paths below are relative to this base URL. |

Backend-side environment variables (see `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string, e.g. `mysql+pymysql://user:pass@host:3306/dbname` |
| `JWT_SECRET_KEY` | Secret used to sign JWTs |
| `JWT_ALGORITHM` | Default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Default `1440` (24h) |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |
| `TAX_RATE` | Flat tax rate applied at checkout, e.g. `0.08` |

---

## Authentication

All protected endpoints require an `Authorization: Bearer <token>` header.
Get a token from `POST /auth/register` or `POST /auth/login`.

### `POST /auth/register`
Create a new account. Returns a token immediately (auto-login on register).

- **Auth required:** No

**Request body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `201 Created`**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-09-02T07:25:58"
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | Email already registered |
| 422 | Validation error (e.g. password < 6 chars, invalid email) |

---

### `POST /auth/login`
- **Auth required:** No

**Request body**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `200 OK`** — same shape as register:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "created_at": "2026-09-02T07:25:58" }
}
```

**Errors**
| Status | Cause |
|---|---|
| 401 | Invalid email or password |
| 422 | Validation error |

---

### `GET /auth/me`
Returns the currently logged-in user.

- **Auth required:** Yes

**Response `200 OK`**
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "created_at": "2026-09-02T07:25:58"
}
```

**Errors**
| Status | Cause |
|---|---|
| 401 | Missing/invalid/expired token |

---

## Products

Public endpoints — no auth required. All product data is served from our own
MySQL database (seeded once from DummyJSON; the app never calls DummyJSON at
runtime).

### `GET /products`
List products. Supports search, category filter, and pagination via query params.

- **Auth required:** No
- **Query params:**

| Param | Type | Required | Notes |
|---|---|---|---|
| `search` | string | No | Case-insensitive substring match on product name |
| `category` | string | No | Exact match, e.g. `beauty`, `fragrances`, `groceries` |
| `skip` | int | No | Default `0` |
| `limit` | int | No | Default `20`, max `100` |

Example: `GET /products?search=mascara&category=beauty&skip=0&limit=20`

**Response `200 OK`**
```json
{
  "total": 3,
  "skip": 0,
  "limit": 20,
  "products": [
    {
      "id": 1,
      "name": "Essence Mascara Lash Princess",
      "description": "Volumizing mascara",
      "price": 9.99,
      "category": "beauty",
      "image_url": "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
      "stock": 99,
      "rating": 2.56
    }
  ]
}
```

---

### `GET /products/{id}`
- **Auth required:** No

**Response `200 OK`** — a single `ProductOut` object (same shape as above, no wrapper).

**Errors**
| Status | Cause |
|---|---|
| 404 | Product not found |

---

## Cart

All cart endpoints require auth and operate on the logged-in user's own cart.

### `GET /cart`
- **Auth required:** Yes

**Response `200 OK`**
```json
{
  "items": [
    {
      "id": 1,
      "product": { "id": 1, "name": "Essence Mascara Lash Princess", "description": "...", "price": 9.99, "category": "beauty", "image_url": "...", "stock": 99, "rating": 2.56 },
      "quantity": 3,
      "line_total": 29.97
    }
  ],
  "subtotal": 29.97,
  "total_items": 3
}
```

---

### `POST /cart/items`
Adds a product to the cart. If the product is already in the cart, quantity is
**increased** by the given amount rather than creating a duplicate row.

- **Auth required:** Yes

**Request body**
```json
{ "product_id": 1, "quantity": 2 }
```

**Response `201 Created`** — full updated `CartOut` (same shape as `GET /cart`).

**Errors**
| Status | Cause |
|---|---|
| 404 | Product not found |
| 422 | `quantity` < 1 |

---

### `PATCH /cart/items/{item_id}`
Sets the quantity of a specific cart item (not incremental).

- **Auth required:** Yes
- Note: `item_id` is the **cart item's** id (from `GET /cart`), not the product id.

**Request body**
```json
{ "quantity": 5 }
```

**Response `200 OK`** — full updated `CartOut`.

**Errors**
| Status | Cause |
|---|---|
| 404 | Cart item not found (or belongs to another user) |
| 422 | `quantity` < 1 |

---

### `DELETE /cart/items/{item_id}`
- **Auth required:** Yes

**Response `200 OK`** — full updated `CartOut` after removal.

**Errors**
| Status | Cause |
|---|---|
| 404 | Cart item not found |

---

## Wishlist

### `GET /wishlist`
- **Auth required:** Yes

**Response `200 OK`**
```json
{
  "items": [
    { "id": 1, "product": { "id": 1, "name": "Essence Mascara Lash Princess", "description": "...", "price": 9.99, "category": "beauty", "image_url": "...", "stock": 99, "rating": 2.56 } }
  ]
}
```

---

### `POST /wishlist/{product_id}`
Adding a product already in the wishlist is a no-op (idempotent, does not duplicate).

- **Auth required:** Yes

**Response `201 Created`** — full updated `WishlistOut`.

**Errors**
| Status | Cause |
|---|---|
| 404 | Product not found |

---

### `DELETE /wishlist/{product_id}`
- **Auth required:** Yes

**Response `200 OK`** — full updated `WishlistOut`.

**Errors**
| Status | Cause |
|---|---|
| 404 | Product not in wishlist |

---

## Orders / Checkout / Simulated Payment

### `POST /orders/checkout`
Creates an order from the logged-in user's **current cart** (read fresh from
the database — the frontend never sends prices, quantities, or totals for
checkout to trust). On success, the cart is cleared and stock is decremented.

- **Auth required:** Yes

**Request body**
```json
{
  "customer_name": "Jane Doe",
  "phone": "9876543210",
  "address_line": "221B Baker Street",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411001",
  "payment_method": "UPI"
}
```
`payment_method` must be one of: `"CARD"`, `"UPI"`, `"NETBANKING"`, `"WALLET"`.
**No card numbers, CVVs, UPI PINs, or bank credentials are ever sent or stored** —
this is a simulated payment; only the chosen method is recorded.

**Response `201 Created`**
```json
{
  "id": 1,
  "customer_name": "Jane Doe",
  "phone": "9876543210",
  "address_line": "221B Baker Street",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411001",
  "subtotal": 29.97,
  "tax": 2.40,
  "total": 32.37,
  "payment_method": "UPI",
  "payment_status": "PAID",
  "order_status": "CONFIRMED",
  "transaction_ref": "TXN-D824DF2635",
  "created_at": "2026-09-02T07:25:58",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Essence Mascara Lash Princess",
      "unit_price": 9.99,
      "quantity": 3,
      "line_total": 29.97
    }
  ]
}
```

`subtotal`, `tax`, and `total` are always computed **server-side** from live
product prices at checkout time. `product_name` and `unit_price` on each order
item are a **snapshot** taken at checkout — they will not change even if the
product is later renamed, repriced, or deleted.

**Errors**
| Status | Cause |
|---|---|
| 400 | Cart is empty |
| 400 | Insufficient stock for one or more items (message names the product) |
| 401 | Not authenticated |
| 422 | Validation error (missing shipping field, invalid `payment_method`) |

---

### `GET /orders`
Order history for the logged-in user, most recent first. Lighter-weight than
the full order detail — use `GET /orders/{id}` for full line items.

- **Auth required:** Yes

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "total": 32.37,
    "payment_status": "PAID",
    "order_status": "CONFIRMED",
    "transaction_ref": "TXN-D824DF2635",
    "created_at": "2026-09-02T07:25:58",
    "item_count": 1
  }
]
```

---

### `GET /orders/{order_id}`
Full order detail, including line items. Only accessible to the order's owner.

- **Auth required:** Yes

**Response `200 OK`** — same shape as the `POST /orders/checkout` response.

**Errors**
| Status | Cause |
|---|---|
| 404 | Order not found, or belongs to another user |

---

### `GET /orders/{order_id}/receipt`
Everything needed to render/print a receipt in one call.

- **Auth required:** Yes

**Response `200 OK`**
```json
{
  "order_id": 1,
  "transaction_ref": "TXN-D824DF2635",
  "customer_name": "Jane Doe",
  "phone": "9876543210",
  "address_line": "221B Baker Street",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411001",
  "items": [
    { "id": 1, "product_id": 1, "product_name": "Essence Mascara Lash Princess", "unit_price": 9.99, "quantity": 3, "line_total": 29.97 }
  ],
  "subtotal": 29.97,
  "tax": 2.40,
  "total": 32.37,
  "payment_method": "UPI",
  "payment_status": "PAID",
  "order_status": "CONFIRMED",
  "order_date": "2026-09-02T07:25:58"
}
```

**Errors**
| Status | Cause |
|---|---|
| 404 | Order not found, or belongs to another user |

---

## Quick endpoint index

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Create account, get token |
| POST | `/auth/login` | No | Log in, get token |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/products` | No | List/search/filter products |
| GET | `/products/{id}` | No | Get one product |
| GET | `/cart` | Yes | View cart |
| POST | `/cart/items` | Yes | Add product to cart |
| PATCH | `/cart/items/{item_id}` | Yes | Change quantity |
| DELETE | `/cart/items/{item_id}` | Yes | Remove from cart |
| GET | `/wishlist` | Yes | View wishlist |
| POST | `/wishlist/{product_id}` | Yes | Add to wishlist |
| DELETE | `/wishlist/{product_id}` | Yes | Remove from wishlist |
| POST | `/orders/checkout` | Yes | Create order from cart, simulate payment |
| GET | `/orders` | Yes | Order history |
| GET | `/orders/{order_id}` | Yes | Order detail |
| GET | `/orders/{order_id}/receipt` | Yes | Printable receipt |

---

## Notes for the frontend / AI generator

- All monetary values are returned as **decimal strings/numbers with 2 decimal
  places** (backed by SQL `DECIMAL`, not float) — display them as-is, don't
  re-round on the frontend.
- Send `Authorization: Bearer <access_token>` on every request to a route
  marked "Auth required: Yes". Store the token (e.g. in memory or
  `localStorage`) after register/login.
- `product_id` (cart/wishlist bodies) and the `{id}` path params always refer
  to **our own internal product id** returned by `GET /products` — never a
  DummyJSON id.
- CORS is open to the origins listed in `CORS_ORIGINS` — make sure your Vite
  dev server URL (default `http://localhost:5173`) is included.
- Standard FastAPI validation errors (`422`) return this shape:
  ```json
  { "detail": [ { "loc": ["body", "email"], "msg": "...", "type": "..." } ] }
  ```
