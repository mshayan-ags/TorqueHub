# TorqueHub 

**Primary Language:** JavaScript  

## 1. Project Overview

**TorqueHub** is a full-stack **automotive parts e-commerce platform** focused on OEM and aftermarket parts such as brake pads, rotors, filters, spark plugs, batteries, and related components.

Internally the three packages are branded consistently:

| Package name              | Role                          |
|---------------------------|-------------------------------|
| `torquehub`               | Backend API                   |
| `torquehub-storefront`    | Customer-facing storefront    |
| `torquehub-admin`         | Admin panel / dashboard       |

There is **no root `package.json`**. The repository is a multi-app layout (not a monorepo with shared packages). Each application has its own `package.json`, environment templates, and is intended to run independently against a shared MongoDB instance and the Backend API.

### Technology Stack Summary

| App        | Stack                                                                 | Default Port |
|------------|-----------------------------------------------------------------------|--------------|
| **Backend**   | Node.js, Express, MongoDB (Mongoose), Socket.IO, Stripe, JWT, Azure Key Vault / Blob Storage, Helmet, express-rate-limit, express-mongo-sanitize | 5000 |
| **Frontend**  | React 18 (Create React App), Tailwind CSS, React Router v6, Stripe React, Socket.IO client, React.lazy code-splitting | 3000 |
| **admin**     | React 18 (CRA), Horizon UI template, Tailwind, MUI (`x-data-grid`), ApexCharts, Chakra UI pieces, MSAL (Azure AD) | 3000 (run on free port) |

---

## 2. High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Customer       │     │  Admin Panel    │
│  Frontend       │     │  (React CRA)    │
│  (React CRA)    │     │                 │
└────────┬────────┘     └────────┬────────┘
         │ HTTP + Socket.IO      │ HTTP + Socket.IO
         │ (JWT Bearer)          │ (JWT + Role)
         ▼                       ▼
┌────────────────────────────────────────────┐
│              Backend (Express)             │
│  • REST routes                             │
│  • JWT auth (User / Admin)                 │
│  • Admin TOTP 2FA                          │
│  • Socket.IO (order rooms + admin room)    │
│  • Stripe PaymentIntents + webhook         │
│  • Image serving (Azure Blob or data URIs) │
│  • Rate limiting, Helmet, mongo-sanitize   │
└────────────────────┬───────────────────────┘
                     │
                     ▼
              MongoDB (Mongoose)
```

### Cross-Cutting Concerns

- **Authentication:** JWT (`Authorization: Bearer <token>`). Separate helpers for customers (`getUserId`) and admins (`getAdminId` + Role check). Admins can enable TOTP 2FA (`/Login-Admin` → `twoFactorRequired` + `pendingToken` → `/Login-Admin/Verify-2FA`).
- **Real-time (Socket.IO):** JWT-authenticated on handshake.
  - `admins` room — admins auto-join; receives `new-sale` on `POST /Create-Sale`.
  - `order:<saleId>` room — client emits `join-order` (ownership-checked); receives `order-update` on `POST /Update-Sale/:id`.
- **Payments:** Stripe PaymentIntents (`/create-payment-intent`, `/confirm-payment-intent`) + raw-body webhook (`/Stripe-Webhook`) that finalizes orders idempotently via `PendingSale` → `Sale` reconciliation.
- **Images:** Azure Blob Storage (or base64 `data:` URIs for seed data). Served via `/GetImage/:filename` (decodes data URIs or 302s to blob URL). Frontends use `REACT_APP_IMAGE_CLOUD`.
- **Guest checkout:** Checkout/Payment pages sit outside `RequireAuth`. A lightweight guest session is created via `POST /Guest-Checkout` and kept in memory only (never `localStorage`).

---

## 3. Repository Structure

```
TorqueHub/
├── .gitignore
├── README.md                          # Extremely detailed project documentation (~40 KB)
├── admin/                             # Admin React app (Horizon UI template)
│   ├── LICENSE.md
│   ├── package.json                   # name: torquehub-admin
│   ├── jsconfig.json
│   ├── postcss.config.js
│   ├── prettier.config.js
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── ProtectedRoute.js          # /auth vs /admin gate
│       ├── routes.js                  # Sidebar-driven route table
│       ├── msalConfig.js
│       ├── index.js / index.css
│       ├── assets/
│       ├── components/                # Sidebar, navbar, charts, MUI tables, etc.
│       ├── context/                   # factory.js + entity contexts, Auth, Socket
│       ├── layouts/                   # admin/, auth/
│       ├── utils/
│       ├── variables/
│       └── views/
│           ├── auth/                  # SignIn (+ 2FA step)
│           └── admin/                 # Dashboard, Brand, Category, Product,
│                                      # Discount, Coupon, Address, User, Sale,
│                                      # Bank, Blog, Review, Settings (2FA)
├── backend/                           # Node/Express API (note: lowercase folder)
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json                   # name: torquehub
│   ├── app.js                         # Entry point
│   ├── seed.js                        # Idempotent demo-data seeder
│   ├── seed-assets/                   # SVG product illustrations
│   ├── Middlewares/
│   │   ├── Server.js                  # Express + HTTP + Socket.IO, Helmet, CORS, sanitize
│   │   ├── Routes.js                  # Mounts all routers
│   │   ├── Db.js                      # Mongo connect + Stripe client
│   │   ├── RateLimiters.js
│   │   └── Socket.js                  # Auth + rooms
│   ├── models/                        # Mongoose schemas
│   ├── routes/                        # Express routers (one per resource)
│   ├── utils/                         # AuthCheck, orderFulfillment, saveImage, validateEnv, etc.
│   └── tests/                         # Jest + Supertest + mongodb-memory-server
└── Frontend/                          # Customer React app
    ├── Dockerfile
    ├── deploy.yml                     # GitHub Actions-style container workflow (not under .github/)
    ├── nginx.conf
    ├── package.json                   # name: torquehub-storefront
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── public/
    ├── README.md                      # Minimal
    └── src/
        ├── App.js                     # createBrowserRouter + React.lazy pages
        ├── index.js / index.css
        ├── link.js                    # BackendLink / ImageCloud / SocketUrl
        ├── Components/
        ├── Pages/                     # ~19 routed pages
        ├── Section/                   # Home sections (TrustBar, CategoryShowcase, etc.)
        ├── assets/
        └── context/                   # Auth, Cart, Product, Wishlist
```

**Note:** The README refers to `Backend/` (capital B) in places, but the actual directory is `backend/` (lowercase).

---

## 4. Backend (API Server)

### 4.1 Entry & Boot

- **Entry:** `backend/app.js`
- `package.json` `"main": "index.js"` is a leftover; the real entry is `app.js`.
- Requiring `Middlewares/Server` runs `validateEnv()` **synchronously** at load time — process exits with a clear error if `JWT_SECRET` or required DB/Stripe/storage config is missing.
- Port: `process.env.PORT || 5000`.
- Mongo connection is skipped when `NODE_ENV === "test"` (Jest uses `mongodb-memory-server`).

### 4.2 Scripts (`backend/package.json`)

```json
"scripts": {
  "test": "jest --runInBand",
  "start": "node app.js",
  "seed": "node seed.js"
}
```

### 4.3 Key Dependencies

| Package | Purpose |
|---------|---------|
| express | HTTP framework |
| mongoose | MongoDB ODM |
| socket.io | Real-time |
| stripe | Payments |
| jsonwebtoken, bcryptjs | Auth |
| otplib, qrcode | Admin TOTP 2FA |
| helmet, express-rate-limit, express-mongo-sanitize | Security |
| @azure/storage-blob, @azure/keyvault-secrets, @azure/identity | Azure storage & secrets |
| nodemailer | Listed (email OTP / reset — not fully wired) |
| jest, supertest, mongodb-memory-server | Testing |

### 4.4 Server Middleware (`Middlewares/Server.js`)

- Helmet (with `crossOriginResourcePolicy: "cross-origin"` so images load cross-origin)
- CORS allow-list from `CORS_ALLOWED_ORIGINS`
- Stripe webhook mounted **before** JSON body parser (raw body required for signature verification)
- `express.json({ limit: "50mb" })` + body-parser for other routes
- Global `express-mongo-sanitize`
- Rate limiting on auth-sensitive routes (default 20 req / 15 min)
- Socket.IO on the same HTTP server

### 4.5 Route Registration (`Middlewares/Routes.js`)

| Router | Purpose |
|--------|---------|
| User | Customer auth, guest checkout, OTP, profile |
| Sale | Orders, tracking, dashboard analytics |
| Coupon | Coupons + redemption |
| Discount | Brand / Category / Product-scoped discounts |
| Bank | Payment methods, Stripe PaymentIntent creation |
| Address | Shipping addresses |
| Product | Products (color / size / material variants) |
| Category | Categories |
| Brand | Brands |
| Admin | Admin auth, 2FA setup / verify / disable |
| Wishlist | Wishlists |
| Blog | Blog posts |
| Review | Product / Sale reviews + moderation |
| Image (`GetImage`) | Image retrieval |
| StripeWebhook | `/Stripe-Webhook` handler |

### 4.6 Mongoose Models (`backend/models/`)

| Model | Key Fields / Notes |
|-------|--------------------|
| **Product** | Unique composite key `ProductCode-color-size-material`; variants via self-refs (`color[]`, `size[]`, `material[]`); materials (ceramic, semi-metallic, aluminum, steel, carbon-fiber, cast-iron…); condition (New/Used/Refurbished/OEM/Aftermarket); `technical_specs`; brand/category refs; images |
| **Sale** | Line items via **SaleOfProduct**; status (`Pending`\|`Processing`\|`Shipped`\|`Delivered`\|`Cancelled`\|`Scheduled`); rich `trackingDetails`; `stripePaymentIntentId` (sparse) |
| **SaleOfProduct** | Join: product, quantity, prices, discounts |
| **PendingSale** | Bridges async Stripe confirmation → real Sale (webhook idempotency) |
| **User** | email unique; `isGuest`; points; stripeID; addresses, banks, wishlist, sales, reviews |
| **Admin** | Role, Responsibilities (Map); `twoFactorSecret` (select:false), `twoFactorEnabled` |
| **Category** | name unique lowercase |
| **Brand** | name unique lowercase; logo → Image; country, website |
| **Discount** | Scoped to Brand/Category/Product; Percentage or FixedAmount; date window |
| **Coupon** | code unique; restrictions (new_user, min/max orders); redemption tracking |
| **Address** | Shipping addresses |
| **Bank** | Payment methods |
| **Wishlist** | User wishlists |
| **Blog** | Blog posts |
| **Review** | Product/Sale reviews |
| **Image** | Stored image metadata / URLs |

### 4.7 Utils & Other Backend Features

- `utils/AuthCheck.js` — JWT extraction helpers
- `utils/orderFulfillment.js` — Shared order finalization path (used by confirm endpoint and webhook)
- `utils/saveImage.js` — Azure / data-URI image handling
- `utils/validateEnv.js` — Boot-time env validation
- `seed.js` — Idempotent demo data (products, categories, brands, etc.) using SVG assets in `seed-assets/`
- Tests under `backend/tests/` with Jest + Supertest + in-memory MongoDB

### 4.8 Docker

- `backend/Dockerfile`
- `backend/docker-compose.yml` (Mongo + API orchestration)
- `.dockerignore`

---

## 5. Customer Frontend (`Frontend/`)

### 5.1 Stack & Config

- CRA + React 18 + Tailwind
- React Router v6 (`createBrowserRouter`)
- Stripe Elements (`@stripe/react-stripe-js`)
- Socket.IO client
- AOS animations, react-slick carousels, SweetAlert2
- Code-splitting via `React.lazy`
- Config in `src/link.js`: `BackendLink`, `ImageCloud`, `SocketUrl`

### 5.2 Key Pages / Routes (approx. 19)

Public and protected routes include:

| Path | Purpose | Guard |
|------|---------|-------|
| `/` | Home | Public |
| `/Category` | Catalog + filters (brand, material, price, etc.) | Public |
| `/ProductDetails/:id` | Product detail (variants, specs, reviews) | Public |
| `/Cart` | Cart | Public |
| `/Checkout`, Payment | Guest or authenticated checkout | Outside RequireAuth |
| `/SignIn`, `/SignUp` | Auth | Public |
| `/Profile`, `/AccountSetting` | Account | RequireAuth |
| `/ChangePassword` | Password change | Public / auth |
| `/Blog`, `/Blog/:id` | Blog listing & detail | Public |
| `/About`, `/privacy-policy`, `/TermsOfUse` | Static pages | Public |
| Order history / tracking | Account area | RequireAuth |

`RequireAuth` checks Auth context token or `localStorage.token` and redirects to `/SignIn` while preserving intended destination.

### 5.3 Components (`src/Components/`)

Header, Footer, product cards (Card, CartCard, Card2), Filter sidebar, Details panel (gallery + variant pills + specs), Comments (star reviews), Payment (Stripe form), Address form, Coupons, Navigation (account sidebar), Table (order history), Blog cards, Breadcrumbs, Dropdown, RequireAuth, etc.

### 5.4 Home Sections (`src/Section/`)

- TrustBar (shipping / genuine parts / support / returns)
- CategoryShowcase
- New (arrivals)
- Blog teaser
- Partners (brand carousel)

### 5.5 Contexts (`src/context/`)

| Context | Main responsibilities |
|---------|------------------------|
| **Auth** | Token, current user, menu state |
| **Cart** | Cart CRUD, totals, discounts, coupons, PlaceOrder, guest session (memory-only), schedule order |
| **Product** | Products, categories, brands, addresses, orders, materials/colors/sizes |
| **Wishlist** | Wishlist CRUD / checks |

### 5.6 Docker & Deploy

- `Frontend/Dockerfile` + `nginx.conf` (SPA serving)
- `Frontend/deploy.yml` — container build/push style workflow (not under `.github/workflows/`, so it will not run automatically)

---

## 6. Admin Panel (`admin/`)

### 6.1 Stack

- Based on **Horizon UI** template
- React 18 + Tailwind + MUI (`x-data-grid`) + ApexCharts + selected Chakra UI pieces
- MSAL packages present (`@azure/msal-browser`, `@azure/msal-react`) but SSO is not the primary login gate
- Socket.IO client for live order notifications

### 6.2 Structure Highlights

- `ProtectedRoute.js` — top-level gate between `/auth` and `/admin`
- `routes.js` — sidebar-driven route definitions
- Entity contexts generated via `context/factory.js`
- Views under `views/admin/`:
  - Dashboard (`default`)
  - Brand, Category, Product management
  - Discount, Coupon
  - Address, User
  - Sale (orders) + EditSale / tracking
  - Bank
  - Blog, Review
  - Settings (including 2FA enrollment)

### 6.3 Auth Flow

- Sign-in with optional TOTP second step
- JWT + Role checks on backend
- Real-time `new-sale` events in admin room

### 6.4 Gaps Specific to Admin

- No dedicated `Dockerfile` / `docker-compose` for the admin app
- MSAL is installed but not used as the primary authentication path

---

## 7. Features Matrix

| Feature | Backend | Frontend | Admin |
|---------|---------|----------|-------|
| JWT auth (customer) | Yes | Yes | — |
| JWT + Role + TOTP 2FA (admin) | Yes | — | Yes |
| Product catalog + variants (color/size/material) | Yes | Yes | CRUD |
| Categories & Brands | Yes | Yes | CRUD |
| Cart & Wishlist | Yes | Yes | — |
| Guest checkout | Yes | Yes | — |
| Stripe PaymentIntents + webhook | Yes | Yes | — |
| Coupons & Discounts | Yes | Yes | CRUD |
| Order tracking (status + carrier details) | Yes | Yes | Yes + edit |
| Real-time order / new-sale events (Socket.IO) | Yes | Yes | Yes |
| Reviews | Yes | Yes | Moderation |
| Blog | Yes | Yes | CRUD |
| Image upload / Azure Blob / data-URI fallback | Yes | Display | Upload |
| Rate limiting on auth routes | Yes | — | — |
| Helmet + mongo-sanitize | Yes | — | — |
| Seed script (demo data) | Yes | — | — |
| Jest + Supertest tests | Yes | CRA defaults | CRA defaults |
| Docker | Yes | Yes | No |
| Email (OTP / password reset) | Dependency present; not fully wired | — | — |

---

## 8. Environment & Configuration

Each app ships with `.env.example` (and Backend also has `.env.docker.example`).

Typical variables (inferred from architecture and README):

**Backend**
- `PORT`, `JWT_SECRET`
- Mongo connection string
- Stripe keys + webhook secret
- Azure storage / Key Vault credentials
- `CORS_ALLOWED_ORIGINS`
- Rate-limit knobs (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`)

**Frontend / admin**
- `REACT_APP_*` for API base URL, image cloud URL, Socket.IO URL, Stripe publishable key
- MSAL-related vars in admin (and partially Frontend)

Boot-time validation in Backend prevents the server from listening with missing critical secrets.

---

## 9. Known Limitations & Gaps (from README + inspection)

- Three independent apps — no shared packages / no true monorepo tooling.
- No Docker assets for the **admin** app.
- `Frontend/deploy.yml` exists but is **not** under `.github/workflows/`, so GitHub Actions will not pick it up.
- `nodemailer` is a dependency but no mailer utility fully wires OTP / password-reset emails.
- MSAL / Azure AD packages are present but do not gate the main login flows.
- Pure REST + Socket.IO (no GraphQL).
- Screenshot placeholders exist in README; no actual screenshots committed under `docs/screenshots/`.
- Folder casing inconsistency: repo uses `backend/`, documentation often writes `Backend/`.
- No root-level license file; no topics, description, or homepage set on the GitHub repo metadata.


## 10. How to Run (High-Level)

1. **MongoDB** — local or Atlas (or via Backend `docker-compose`).
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env   # fill secrets
   npm install
   npm run seed           # optional demo data
   npm start              # → :5000
   ```
3. **Frontend**
   ```bash
   cd Frontend
   cp .env.example .env
   npm install
   npm start              # → :3000
   ```
4. **Admin**
   ```bash
   cd admin
   # configure .env
   npm install
   npm start              # use a free port if Frontend already owns 3000
   ```

Docker options exist for Backend and Frontend; Admin is local-only as shipped.

---

## 11. Summary

**TorqueHub** is a complete, multi-application automotive parts e-commerce system:

- **Backend** — Express + MongoDB API with customer JWT auth, admin JWT + optional TOTP 2FA, Stripe payments with idempotent webhook fulfillment, Socket.IO order/admin rooms, rate limiting, security middleware, and Azure-backed (or data-URI) image storage.
- **Frontend** — Customer storefront with catalog + multi-attribute filtering, cart, guest or authenticated checkout, Stripe pay, wishlist, reviews, blog, live order tracking, and account management.
- **admin** — Horizon UI–based management console for catalog, orders (with tracking edit), users, coupons, discounts, blogs, and reviews, plus a dashboard and real-time new-order alerts.

The repository ships with a very thorough README that already documents architecture, models, routes, frontend structure, gaps, and key paths in depth. This file consolidates and extends that documentation with observed package names, directory realities, dependency lists, Git metadata, and an honest assessment of the repository’s public signals.

---
