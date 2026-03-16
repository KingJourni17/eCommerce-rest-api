# 🛒 MicroCommerce — E-Commerce REST API

Production-ready e-commerce API with product catalog, cart, orders, payments (Stripe), inventory management, and admin dashboard. Follows REST best practices with OpenAPI 3.0 docs.

## Features
- **Product catalog** — categories, variants (size/color), image management, search + filter
- **Inventory** — real-time stock tracking, low-stock alerts, warehouse support
- **Cart** — session + authenticated carts, coupon codes, tax calculation
- **Orders** — full order lifecycle (pending → processing → shipped → delivered)
- **Payments** — Stripe integration with webhooks for async payment confirmation
- **Users** — customer accounts, address book, order history
- **Admin** — product management, order processing, analytics dashboard
- **Caching** — Redis cache for product catalog (TTL-based)
- **Rate limiting** — 100 req/min per IP

## Tech Stack
`Node.js 20` · `Express` · `PostgreSQL` · `Redis` · `Stripe` · `Cloudinary` (images)

## Quick Start
```bash
# create .env file     # add DB_URL, STRIPE_SECRET_KEY, etc.
npm install
npm run migrate
npm run dev              # http://localhost:3000/api
# Docs: http://localhost:3000/api/docs
```

## Core Endpoints
```
Products:  GET/POST /api/products   GET /api/products/:id
Cart:      GET/POST/DELETE /api/cart
Orders:    POST /api/orders   GET /api/orders/:id
Payments:  POST /api/payments/checkout   POST /api/payments/webhook
Admin:     /api/admin/products  /api/admin/orders  /api/admin/analytics
```

## License
MIT
