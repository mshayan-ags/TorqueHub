# TorqueHub
---

### Customer Frontend

| Home | Category / Filters |
|------|---------------------|
| *(capture: hero + trust bar + category showcase)* | *(capture: `/Category` with brand/material/price filters)* |

| Product Details | Cart / Checkout |
|------------------|-------------------|
| *(capture: `/ProductDetails/:id` with variant pills and spec sheet)* | *(capture: `/Cart` and the guest-checkout billing form)* |

### Admin Panel

| Sign In (+ 2FA) | Dashboard |
|------------------|-----------|
| *(capture: `/auth/sign-in`, including the TOTP step)* | *(capture: `/admin/default` — widgets + order table)* |

| Orders / Tracking | Product / Blog / Review management |
|--------------------|--------------------------------------|
| *(capture: `/admin/Sale` and `/admin/EditSale/:id`)* | *(capture: `/admin/Product`, `/admin/Blog`, `/admin/Review`)* |

*Once captured, drop the PNGs into `docs/screenshots/` and swap the placeholders above for `![alt](docs/screenshots/....png)` image links, following the same table layout.*

---

## 1. Project Overview

**TorqueHub** is a full-stack **automotive parts e-commerce platform** (brake pads, rotors, filters, spark plugs, batteries, and similar OEM/aftermarket parts). Internally the backend package is named **`torquehub`**, the customer frontend is **`torquehub-storefront`**, and the admin app is **`torquehub-admin`** — the branding is consistent across all three.

It consists of **three separate applications**:

| Part       | Role                                        | Stack                                                                 | Default port / notes         |
|------------|----------------------------------------------|------------------------------------------------------------------------|-------------------------------|
| **Backend**   | REST API + WebSocket server + Stripe webhook | Node.js, Express, MongoDB (Mongoose), Socket.IO, Stripe, JWT, Azure Key Vault / Blob Storage | `5000`                        |
| **Frontend**  | Customer-facing store                        | React 18 (CRA), Tailwind, React Router v6, Stripe React, Socket.IO client, `React.lazy` code splitting | `3000` (CRA default)          |
| **admin**     | Admin panel / dashboard                      | React 18 (CRA), Horizon UI template, Tailwind, MUI (`x-data-grid`), ApexCharts, Chakra UI pieces, MSAL | `3000` (CRA default, run on a free port alongside Frontend) |

There is **no root `package.json`**. Each app has its own `package.json`, `.env.example`, `Dockerfile`, and is meant to be run independently against a shared MongoDB instance and the Backend API.

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

- **Authentication:** JWT (`Authorization: Bearer <token>`). Separate helpers for **customer** (`getUserId`) and **admin** (`getAdminId`, which also checks `Role`). Admin accounts optionally require a second TOTP step (`/Login-Admin` → `twoFactorRequired` + `pendingToken` → `/Login-Admin/Verify-2FA`).
- **Real-time:** Socket.IO, JWT-authenticated on handshake:
  - `admins` room — admins auto-join on connect; receives `new-sale` when `POST /Create-Sale` fires.
  - `order:<saleId>` room — joined via a client-emitted `join-order` event (ownership-checked: admin or the sale's own user only); receives `order-update` when `POST /Update-Sale/:id` fires.
- **Payments:** Stripe PaymentIntents (`/create-payment-intent`, `/confirm-payment-intent`) plus a raw-body webhook (`/Stripe-Webhook`) that finalizes orders idempotently via a shared `PendingSale` → `Sale` reconciliation path — this is the backstop for orders whose browser tab never completes the confirm step.
- **Images:** Uploaded to Azure Blob Storage (or embedded as base64 `data:` URIs for seed data) and served through `/GetImage/:filename`, which decodes `data:` URIs directly (browsers block redirecting to a `data:` URI) or 302s to the real blob URL otherwise. Frontend/admin read images via `REACT_APP_IMAGE_CLOUD`.
- **Guest checkout:** `Checkout`/`Payment` pages are intentionally left outside the frontend's `RequireAuth` guard; a lightweight guest session is created transparently (`POST /Guest-Checkout`) and held only in memory (never `localStorage`).

---

## 3. Repository Structure

```
Azure Ecommerce/
├── .gitignore
├── README.md
├── admin/                  # Admin React app (Horizon UI template)
│   ├── .env.example
│   ├── LICENSE.md
│   ├── package.json
│   ├── jsconfig.json
│   ├── postcss.config.js
│   ├── prettier.config.js
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── ProtectedRoute.js   # top-level /auth vs /admin gate
│       ├── routes.js           # sidebar-driven route table
│       ├── msalConfig.js
│       ├── index.js / index.css
│       ├── assets/
│       ├── components/         # sidebar, navbar, charts, Tables/MUI, etc.
│       ├── context/             # factory.js + one file per entity, Auth, Socket
│       ├── layouts/             # admin/, auth/
│       ├── utils/
│       ├── variables/
│       └── views/
│           ├── auth/            # SignIn (+ 2FA step)
│           └── admin/           # default (dashboard), Brand, Category, Product,
│                                 # Discount, Coupon, Address, User, Sale, Bank,
│                                 # Blog, Review, Settings (2FA enrollment)
├── Backend/                # Node/Express API
│   ├── .env.example
│   ├── .env.docker.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   ├── app.js              # entry point
│   ├── seed.js              # idempotent demo-data seeder (npm run seed)
│   ├── seed-assets/         # SVG product illustrations used by seed.js
│   ├── Middlewares/
│   │   ├── Server.js        # app + http server + Socket.IO wiring, helmet/cors/sanitize
│   │   ├── Routes.js        # mounts every router
│   │   ├── Db.js            # Mongo connect + Stripe client resolution
│   │   ├── RateLimiters.js
│   │   └── Socket.js        # Socket.IO auth + join-order / admins rooms
│   ├── models/               # Mongoose schemas
│   ├── routes/                # Express routers (one per resource)
│   ├── utils/                 # AuthCheck, functions, orderFulfillment, saveImage, validateEnv
│   └── tests/                 # Jest + Supertest, mongodb-memory-server
└── Frontend/                # Customer React app
    ├── .env.example
    ├── Dockerfile
    ├── deploy.yml            # GitHub Actions container build/push workflow
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── public/
    └── src/
        ├── App.js            # createBrowserRouter route table, React.lazy pages
        ├── index.js / index.css
        ├── link.js           # BackendLink / ImageCloud / SocketUrl
        ├── Components/
        ├── Pages/            # 19 routed pages
        ├── Section/          # Home page sections (TrustBar, CategoryShowcase, New…)
        ├── assets/
        └── context/          # Auth, Cart, Product, Wishlist
```

---

## 4. Backend (API Server)

### 4.1 Entry & Boot

- **Entry:** `Backend/app.js`
  ```js
  require("dotenv").config();
  const { httpServer, port, app } = require("./Middlewares/Server");
  const Routes = require("./Middlewares/Routes");
  httpServer.listen(port, () => console.log(`Server on http://localhost:${port}`));
  ```
  (`package.json`'s `"main": "index.js"` is a leftover — the app is actually booted via `app.js`.)
- Requiring `Middlewares/Server` runs `validateEnv()` **synchronously at load time** — the process exits with a clear error before ever listening if `JWT_SECRET` or a resolvable DB/Stripe/storage config is missing.
- `Middlewares/Server` also builds the raw `http.Server`, attaches Socket.IO, and skips the Mongo `connect()` call when `NODE_ENV === "test"` (the Jest suite boots its own `mongodb-memory-server` instance instead).
- `port = process.env.PORT || 5000`.

### 4.2 Server Middleware (`Middlewares/Server.js`)

- **Helmet** — security headers, with `crossOriginResourcePolicy: { policy: "cross-origin" }` relaxed so the Frontend/admin origins can load product `<img>` tags from `/GetImage`.
- **CORS** — allow-list from `CORS_ALLOWED_ORIGINS` (comma-separated), `credentials: true`.
- **Stripe webhook mounted before the JSON body parser** — `/Stripe-Webhook` needs the raw request body to verify Stripe's signature; every other route goes through `express.json({ limit: "50mb" })` + `body-parser`.
- **express-mongo-sanitize** — applied globally, strips `$`/`.` keys from `req.body`/`req.query`/`req.params`.
- **express-rate-limit** (`RateLimiters.js`, `authLimiter`) — default 20 requests / 15-minute window (`RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`), applied per-route to: `POST /Login`, `/Change-Password`, `/Forget-Password`, `/Verify-OTP`, `/Resend-OTP` (User.js) and `/Login-Admin`, `/Login-Admin/Verify-2FA`, `/2FA/Setup`, `/2FA/Verify-Enable`, `/2FA/Disable` (Admin.js).
- **Socket.IO** initialized on the same HTTP server, same CORS allow-list.

### 4.3 Route Registration (`Middlewares/Routes.js`)

Mounted routers:

| Router            | Purpose                                        |
|--------------------|-------------------------------------------------|
| User               | Customer auth, guest checkout, OTP, profile     |
| Sale               | Orders, tracking, dashboard analytics           |
| Coupon             | Coupons + redemption                            |
| Discount           | Brand/Category/Product-scoped discounts         |
| Bank               | Payment methods, Stripe PaymentIntent creation  |
| Address            | Shipping addresses                              |
| Product            | Products (incl. color/size/material variants)   |
| Category           | Categories                                      |
| Brand              | Brands                                          |
| Admin              | Admin auth, 2FA setup/verify/disable             |
| Wishlist           | Wishlists                                       |
| Blog               | Blog posts                                      |
| Review             | Product/Sale reviews + moderation                |
| Image (`GetImage`) | Image retrieval                                 |
| StripeWebhook       | Stripe webhook handler (`/Stripe-Webhook`)      |

### 4.4 Models (Mongoose)

Located in `Backend/models/`:

| Model            | Description |
|------------------|-------------|
| **Product**      | `Product` (unique composite key `ProductCode-color-size-material`), `ProductCode`, `name`, `description`, `price`, `quantity`, `currentColor`, `currentSize`, `currentMaterial` (automotive materials — ceramic, semi-metallic, aluminum, steel, carbon-fiber, cast-iron, etc.), `condition` (New/Used/Refurbished/OEM/Aftermarket), `isArchive`, `specifications`, `technical_specs` (`weight`, `dimensions`, `warranty`), `brand` → Brand, `category` → Category, `Discount`, `review[]`, `whishlist[]`, `color[]`/`size[]`/`material[]` (self-refs to Product — variant linking), `images[]` → Image |
| **Sale**         | `User`, `Discount`, `Product[]` → **SaleOfProduct** (line items, not raw Product refs), `Address`, `Bank`, `Review`, `CouponRedeem`, `totalAmount`, `totalAmountAfterDiscount`, `couponvalue`, `paymentMethod`, `status` (`Pending`\|`Processing`\|`Shipped`\|`Delivered`\|`Cancelled`\|`Scheduled`), `trackingDetails` (carrier, trackingNumber, estimatedDeliveryDate, currentLocation, lastUpdated, deliveryAttempts, comments), `deliveryDate`, `scheduleDate`, `Notes`, `stripePaymentIntentId` (sparse index) |
| **SaleOfProduct**| Line-item join between Sale and Product: `product`, `Discount[]`, `Sale`, `quantity`, `totalPrice`, `totalPriceAfterDiscount` |
| **PendingSale**  | `User`, `stripePaymentIntentId` (unique), `orderPayload` (Mixed), `status` (`Pending`\|`Completed`\|`Failed`), `Sale` — bridges async Stripe confirmation into a real `Sale`, keyed for webhook idempotency |
| **User**         | `name`, `email` (unique), `points`, `stripeID` (unique), `password` (not required if `isGuest`), `subscriber`, `profilePicture`, `Bank[]`, `Address[]`, `Whishlist` (single ref), `isGuest`, `Review[]`, `Sale[]`, `CouponRedeem[]` |
| **Admin**        | `name`, `email` (unique), `phoneNumber` (unique), `password`, `Role`, `Responsiblities` (Map<Boolean>), `profilePicture`, `Blog[]`, `Discount[]`, `Coupon[]`, `twoFactorSecret` (select:false), `twoFactorEnabled` |
| **Category**     | `name` (unique, lowercase), `description`, `Product[]`, `Discount` |
| **Brand**        | `name` (unique, lowercase), `description`, `country`, `website`, `logo` → Image, `Product[]`, `Discount` |
| **Discount**     | `type` (`Brand`\|`Category`\|`Product`), `targetType` (`refPath: 'type'`), `Product[]`, `SaleOfProduct[]`, `DiscountType` (`Percentage`\|`FixedAmount`), `value`, `startDate`, `endDate`, `isActive`, `Admin` |
| **Coupon**       | `code` (unique), `discountType`, `discountValue`, `minimumPurchase`, `expirationDate`, `restrictions` (e.g. `new_user`, `min_orders_N`, `max_orders_N`), `isActive`, `CouponRedeem[]`, `Admin` |
| **ReedemCoupon** (`CouponRedeem`) | `Coupon`, `User`, `Sale`, `user_coupon` (unique, `${userId}_${couponId}`), `coupon_sale`, `isUsed` |
| **Address**      | `User`, `Sale[]`, `full_name`, `phone_number`, `address_line1/2`, `city`, `state`, `postal_code`, `country`, `is_default`, `isArchive` |
| **Bank**         | `User`, `Sale[]`, `bank_name`, `account_number`, `account_detail` (unique), `country`, `stripeID` (unique), `is_default`, `is_verified`, `isArchive` |
| **Review**       | `targetType` (`Product`\|`Sale`), `targetId`, `user`, `rating` (1–5), `comment`, `Product[]`, `Sale[]`, `isApproved` (default `false` — moderation gate) |
| **Whishlist** (`Wishlist`) | `user` (required, unique index — one doc per user), `product` — an **array** of Product refs, not a single ref |
| **Blog**         | `title`, `content`, `categories[]`, `tags[]`, `publicationDate`, `Admin`, `Image[]`, `isArchive` |
| **Image**        | `filename`, `mimetype`, `blobUrl`, `blobName`, `containerName` (default `"uploads"`), optional owner refs (`Admin`/`User`/`Brand`/`Product`/`Blog`) |

### 4.5 Auth (`utils/AuthCheck.js`)

- Requires `JWT_SECRET` (validated at boot by `validateEnv()`).
- `getUserId(req)` — decodes `Authorization: Bearer <jwt>`, confirms the user still exists, returns `{ id }` or `{ message }`.
- `getAdminId(req)` — same, plus confirms the token's `Role` still matches the Admin document; returns `{ id, Role }` or `{ message }`.

### 4.6 Real-time (`Middlewares/Socket.js`)

- Handshake auth via `socket.handshake.auth.token`, verified against Admin or User.
- Admins auto-join the `admins` room on connect.
- `join-order` (client emits a `saleId`) — joins `order:<saleId>` only if the caller is an admin or the sale's own user; otherwise emits `join-order-error`.

### 4.7 Utilities (`Backend/utils/`)

| File | Purpose |
|---|---|
| `AuthCheck.js` | JWT decode/verify for users and admins (see §4.5) |
| `functions.js` | `filterArrayOfObjectAndRemoveRepetitions`, `CheckAllRequiredFieldsAvailaible` (generic required-field validator) |
| `orderFulfillment.js` | `createSaleFromOrder(orderPayload, userId)` — the single order-creation path shared by `POST /Create-Sale` and the Stripe webhook; idempotent on `stripePaymentIntentId` |
| `saveImage.js` | Uploads/deletes images in Azure Blob Storage; resolves the connection string directly or via Key Vault |
| `validateEnv.js` | Fail-fast startup check for `JWT_SECRET` + a resolvable DB/Stripe/storage config |

### 4.8 Payments

- Stripe client resolved in `Middlewares/Db.js` from `STRIPE_SECRET_KEY` directly, or lazily from Azure Key Vault via `STRIPE_SECRET_IDENTIFIER`.
- `POST /create-payment-intent` — creates/reuses a Stripe Customer, creates a PaymentIntent, optionally records a `PendingSale` when an `orderPayload` is supplied.
- `POST /confirm-payment-intent` — attaches the payment method, saves it as a `Bank` record, confirms the PaymentIntent.
- `POST /Stripe-Webhook` — raw-body route, verifies `STRIPE_WEBHOOK_SECRET`; on `payment_intent.succeeded` looks up the matching `PendingSale` and finalizes it via `createSaleFromOrder`. Verified idempotent by `tests/webhook.test.js`.

### 4.9 Seed Data (`Backend/seed.js`)

Idempotent demo-catalog seeder (`npm run seed`) — deletes and recreates only the records it tags itself, so it's safe to re-run against a real database:

- **1 brand:** TorqueTech Performance
- **3 categories:** brake systems, filters, electrical
- **6 products** (with real SVG illustrations from `Backend/seed-assets/`): Ceramic Brake Pad Set, Vented Brake Rotor, Spin-On Oil Filter, High-Flow Air Filter, Iridium Spark Plug Set, AGM Starting Battery
- **1 blog post:** "5 Signs Your Brakes Need Attention"
- **2 demo accounts:** `admin@torquehub.demo` / `password123` (Role: Admin), `customer@torquehub.demo` / `password123`

### 4.10 Tests

Jest + Supertest against `mongodb-memory-server` (`Backend/tests/`):

| File | Covers |
|---|---|
| `setup.js` | Shared env/DB bootstrap for every test file |
| `auth.test.js` | `/Login` and `/Change-Password` reject wrong passwords |
| `features.test.js` | Image serving (redirect vs. `data:` URI decode + CORP header), `/Create-Bank`, Wishlist round-trip, Review moderation |
| `ownership.test.js` | Missing-Authorization-header returns 401 (not 500); cross-user Address updates return 403 |
| `webhook.test.js` | Stripe webhook idempotency — duplicate `payment_intent.succeeded` events create exactly one `Sale` |

### 4.11 Backend Dependencies (key)

- express, mongoose, dotenv, cors, helmet, express-rate-limit, express-mongo-sanitize
- jsonwebtoken, bcryptjs, otplib, qrcode (admin TOTP 2FA), email-validator, email-verifier
- stripe, socket.io, nodemailer, node-cron, axios, moment, body-parser
- `@azure/identity`, `@azure/keyvault-secrets`, `@azure/storage-blob` (Key Vault secret resolution + Blob image storage)
- Dev: nodemon, jest, supertest, mongodb-memory-server

### 4.12 Backend Scripts

```bash
npm start   # node app.js
npm run seed # node seed.js — idempotent demo data
npm test    # jest --runInBand
```

### 4.13 Backend Environment (`.env.example`)

```env
PORT=5000
NODE_ENV=development

# Auth
JWT_SECRET=changeme

# Database — set MONGODB_URI directly for local dev, or leave it unset and
# provide COSMOS_SECRET_IDENTIFIER to resolve the connection string from
# Azure Key Vault instead (used in production).
MONGODB_URI=mongodb://localhost:27017/torquehub
COSMOS_SECRET_IDENTIFIER=

# Stripe — set STRIPE_SECRET_KEY directly for local dev, or leave it unset
# and provide STRIPE_SECRET_IDENTIFIER to resolve it from Key Vault instead.
STRIPE_SECRET_KEY=
STRIPE_SECRET_IDENTIFIER=
STRIPE_WEBHOOK_SECRET=

# Azure Blob Storage — set AZURE_STORAGE_CONNECTION_STRING directly for local
# dev, or leave it unset and provide STORAGE_SECRET_IDENTIFIER instead.
AZURE_STORAGE_CONNECTION_STRING=
STORAGE_SECRET_IDENTIFIER=

# CORS — comma-separated list of allowed frontend origins
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate limiting (optional, defaults shown)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=20
```

A separate `.env.docker.example` exists for the Docker/Compose path, adding `AZURE_TENANT_ID` / `AZURE_CLIENT_ID` / `AZURE_CLIENT_SECRET` and using the `*_SECRET_IDENTIFIER` (Key Vault) variables in place of direct connection strings — the production/container secret-resolution path.

### 4.14 Docker

```bash
cd Backend
docker compose up --build   # reads secrets from .env.docker (gitignored)
```

`Dockerfile` is a small multi-stage Alpine build (`node:20-alpine`) that installs production dependencies only and runs `npm start`, exposing port 5000.

---

## 5. Customer Frontend

### 5.1 Tech Stack

- React 18 + Create React App (`react-scripts` 5)
- React Router DOM v6 (`createBrowserRouter`, every page `React.lazy`-loaded behind one `<Suspense>`)
- Tailwind CSS
- Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- Socket.IO client (live order tracking)
- SweetAlert / SweetAlert2, Headless UI, Heroicons, React Icons, Axios, Moment

### 5.2 Configuration (`src/link.js`)

```js
const BackendLink = process.env.REACT_APP_PUBLIC_PATH || "http://localhost:5000"
const ImageCloud  = process.env.REACT_APP_IMAGE_CLOUD  || "http://localhost:5000/GetImage"
const SocketUrl   = process.env.REACT_APP_SOCKET_URL   || "http://localhost:5000"
```

The Stripe publishable key has no fallback and is read directly from `process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY` inside `Components/Payment/index.js` — if unset, checkout shows "Payments are not configured" instead of crashing.

### 5.3 Environment (`.env.example`)

```env
REACT_APP_PUBLIC_PATH=http://localhost:5000
REACT_APP_IMAGE_CLOUD=http://localhost:5000/GetImage
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MSAL_CLIENT_ID=changeme
REACT_APP_MSAL_AUTHORITY=https://login.microsoftonline.com/changeme
REACT_APP_MSAL_REDIRECT_URI=http://localhost:3000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_changeme
```

> The `REACT_APP_MSAL_*` vars are reserved for a future Azure AD SSO flow — no `@azure/msal-*` package or usage currently exists in the storefront's `src/`.

### 5.4 Pages (`src/Pages/`) & Routes (`src/App.js`)

| Route | Page | Guard |
|---|---|---|
| `/` , `*` | Home | Public |
| `/SignIn` | Singin.js | Public |
| `/SignUp` | Signup.js | Public |
| `/Category`, `/Category/:name` | Category | Public |
| `/ProductDetails/:id` | ProductDetails | Public |
| `/Cart` | Cart | Public |
| `/Checkout` | Checkout | Public — guest checkout allowed |
| `/Payment` | Payment | Public — guest checkout allowed |
| `/OrderTracking/:id` | OrderTracking | Public (live-updates via Socket.IO if signed in) |
| `/Wishlist` | Wishlist | **RequireAuth** |
| `/OrderHistory` | OrderHistory | **RequireAuth** |
| `/Profile` | Profile | **RequireAuth** |
| `/AccountSetting` | AccountSetting | **RequireAuth** |
| `/ChangePassword` | ChangePassword | Public |
| `/About` | About | Public |
| `/Blog` | Blog | Public |
| `/Blog/:id` | BlogDetail | Public |
| `/privacy-policy` | Privacy | Public |
| `/TermsOfUse` | TAC.js | Public |

`RequireAuth` checks `Token` (Auth context) or `localStorage.token`; if absent, redirects to `/SignIn`, preserving the origin location so the user lands back where they started after logging in.

### 5.5 Components (`src/Components/`)

| Component | Purpose |
|---|---|
| Header / Footer | Site nav (cart/wishlist/account) and footer |
| Card, CartCard, Card2, AddressCard | Product grid card, cart line item, alternate list card, saved-address card |
| Filter | Category/brand/material/color/size sidebar filters |
| Details | Product detail panel — gallery, variant pills, spec sheet |
| Comments | Star-rating review widget (submit + list) |
| Payment | Stripe Elements checkout form (guest + authenticated) |
| Address | Billing/shipping address entry form |
| Coupons | Available/applied coupon display |
| Navigation | Account-page sidebar (Dashboard, Order History, Settings, Wishlist, Change Password) |
| Table | Order-history table with status badges |
| Blog Card | Blog post preview card |
| ChangePassword, setting | Account forms |
| Dropdown, RequireAuth, BreadCrumbs / BreadCrumbContainer | Shared primitives / route guard |

### 5.6 Home Sections (`src/Section/`)

`TrustBar` (fast shipping / genuine parts / expert support / easy returns), `CategoryShowcase`, `New` (arrivals grid), `Blog` (teaser), `Partners` (brand carousel).

### 5.7 Context (`src/context/`)

| Context | Exposes |
|---|---|
| **Auth** | `Token, setToken, CheckToken, currUser, GetCurrentUser, MenuOpen, setMenuOpen` |
| **Cart** | `Cart, AddToCart, UpdateItemCart, RemoveItemCart, isItemCart, getItemCart, getTotal, getSubTotal, getDiscount, getCouponDiscount, getTotalAfterCoupon, PlaceOrder, Address, Notes, Coupon, ReedeemCoupon, AllCoupon, GetAllCouponsUser, UsedCoupon, ScheduleOrder, GuestInfo, GuestSession, EnsureGuestSession` (guest data is memory-only, never persisted to `localStorage`) |
| **Product** | `AllProduct, GetAllProduct, AllCategories, GetAllCategories, AllBrand, GetAllBrand, AllAddress, GetAllAddress, AllOrders, GetAllOrders, Materials, AllColors, AllSizes, shuffleArr` |
| **Wishlist** | `Wishlist, GetWishlist, isWishlisted, AddToWishlist, RemoveFromWishlist, ToggleWishlist` |

### 5.8 Frontend Scripts

```bash
npm start   # react-scripts start
npm run build
npm test
```

### 5.9 Docker / CI

`Frontend/Dockerfile` is a two-stage build (Node → Nginx) serving the production build on port 80. `Frontend/deploy.yml` is a GitHub Actions workflow (build & push the container image to an Azure Container Registry on push to `main`/`master`) — note it currently lives at `Frontend/deploy.yml` rather than under `.github/workflows/`, so it will not run as-is until moved.

---

## 6. Admin Panel

### 6.1 Tech Stack

- React 18 + CRA, built on the **Horizon UI** admin template
- Tailwind (+ `tailwindcss-rtl`) alongside Material UI (`@mui/material`, `@mui/x-data-grid` for entity tables) and select Chakra UI primitives (modal/popover/portal/tooltip)
- ApexCharts / `react-apexcharts`, Framer Motion, React Calendar, React Table
- React Router v6, Axios, SweetAlert, Moment, React Icons
- `@azure/msal-browser` / `@azure/msal-react` — wired into the provider tree but not currently consumed to gate login (see §6.6)

### 6.2 Configuration

- `REACT_APP_PUBLIC_PATH` — backend API base URL, used by every axios call and the Socket.IO connection.
- `REACT_APP_MSAL_CLIENT_ID` / `_AUTHORITY` / `_REDIRECT_URI` — Azure AD app registration for the (currently unused) MSAL provider.
- Path aliases via `jsconfig.json` (e.g. `views/...`, `context/...`).
- No `PORT` env var — stock CRA default of **3000** (run alongside the Frontend by starting it on a free port, e.g. `PORT=3001 npm start`).

### 6.3 Provider Tree (`src/index.js`)

```
BrowserRouter
 └ AuthProvider (context/Auth — Token, currAdmin, 2FA-aware)
    └ SocketProvider (context/Socket — "new-sale" notifications)
       └ Brand → Sale → Category → Coupon → Discount → Address
          → Bank → User → Product → Blog → Review  (all via context/factory.js)
             └ MsalProvider (@azure/msal-react)
                └ App
```

`App.jsx` computes `isLoggedIn = !!(Token || localStorage.token)` and renders `useRoutes(getRoutes(isLoggedIn))`, where `getRoutes` comes from `src/ProtectedRoute.js` — the single place that decides `/auth/*` vs `/admin/*` vs the catch-all, each redirecting to the other side if the login state doesn't match.

### 6.4 Routes (`src/routes.js`)

| Name            | Path                                        | Sidebar? |
|-----------------|----------------------------------------------|----------|
| Sign In         | `/auth/sign-in`                              | Hidden |
| Main Dashboard  | `/admin/default`                             | Visible |
| Brand / AddBrand | `/admin/Brand`, `/admin/AddBrand/:id`       | List visible, form hidden |
| Category / AddCategory | `/admin/Category`, `/admin/AddCategory/:id` | List visible, form hidden |
| Discount / AddDiscount | `/admin/Discount`, `/admin/AddDiscount/:id` | List visible, form hidden |
| Coupon / AddCoupon | `/admin/Coupon`, `/admin/AddCoupon/:id`   | List visible, form hidden |
| Product / AddProduct / SelectProduct | `/admin/Product`, `/admin/AddProduct/:id`, `/admin/SelectProduct/:ProductCode/:Type/:id` | List visible, form + variant-picker hidden |
| Address         | `/admin/Address`                             | Visible (list-only) |
| User            | `/admin/User`                                | Visible (list-only) |
| Sale / EditSale | `/admin/Sale`, `/admin/EditSale/:id`         | List visible, tracking/status editor hidden |
| Bank            | `/admin/Bank`                                | Visible (list-only) |
| Blog / AddBlog  | `/admin/Blog`, `/admin/AddBlog/:id`          | List visible, form hidden |
| Review          | `/admin/Review`                              | Visible (list + inline approve/hide) |
| Settings        | `/admin/Settings`                            | Visible — 2FA enrollment/disable |

### 6.5 Context Factory (`src/context/factory.js`)

Every entity context (Address, Bank, Blog, Brand, Category, Coupon, Discount, Product, Review, Sale, User) is generated by one shared `createEntityContext({ name, endpoint, transform })` factory rather than hand-duplicated per entity — each instantiation exposes `GetAll{name}`, `All{name}`, `{name}Error`, fetches on mount/`Token` change, and deliberately preserves each endpoint's exact (sometimes inconsistently pluralized, e.g. `GetAllCategorys`, `GetAllAddresss`) spelling to match the Backend routes exactly. `Auth` and `Socket` are standalone, non-factory contexts.

### 6.6 Admin 2FA & Real-Time Notifications

- **Login → 2FA:** `POST /Login-Admin` returns `{ twoFactorRequired, pendingToken }` when the admin has 2FA enabled; the sign-in form then posts the 6-digit code to `POST /Login-Admin/Verify-2FA` before storing the real token.
- **Settings page:** `/admin/Settings` drives enrollment (`POST /2FA/Setup` → QR code) → verification (`POST /2FA/Verify-Enable`) → disable (`POST /2FA/Disable`, password re-entry).
- **Notification bell:** `context/Socket.js` connects once an admin token exists, listens for `new-sale`, and maintains a capped `notifications` list with `unreadCount` / `markAllRead()`.
- **MSAL note:** `MsalProvider` is instantiated in the provider tree, but `isLoggedIn` (and therefore all routing) is still driven purely by `AuthContext.Token` / `localStorage.token` — MSAL/Azure AD SSO is present but not yet wired into the actual login gate.

### 6.7 Dashboard (`views/admin/default/index.jsx`)

- **Live data:** the 6 top stat widgets (Total Revenue, Total Orders, Pending Orders, Delivered Orders, Total Users, Total Products) and both order tables pull from `Sale`/`User`/`Product` context, preferring a `GET /Dashboard-Stats` aggregation with a client-side fallback computed over `AllSale`.
- **Still static demo data:** the four chart widgets below them (`TotalSpent`, `WeeklyRevenue`, `DailyTraffic`, `PieChartCard`) still render the original Horizon UI template's hardcoded numbers/series — a known gap if the dashboard needs to be fully data-driven.

### 6.8 Admin Scripts

```bash
npm start
npm run build
npm test
npm run pretty   # Prettier --write
```

---

## 7. Feature Summary

### Customer-facing

- Browse by category with brand/material/color/size/price filters; product detail with variant switching (color/size/material)
- Cart, wishlist, guest or authenticated checkout
- Stripe card payments with a webhook backstop for interrupted sessions
- Order history and **live** order-status tracking (Socket.IO)
- Star-rating reviews with admin moderation before they're publicly visible
- Profile dashboard, account settings, change password
- Blog list + detail
- Coupon application at checkout
- Loyalty `points` field on User (accrual/redemption logic not exposed as a dedicated route)

### Admin

- Dashboard with live order/user/product stats plus template chart widgets
- CRUD for Brands, Categories, Products (incl. color/size/material variants), Discounts, Coupons, Blogs
- Manage Users, Addresses, Bank/payment records
- Manage Sales — status, carrier/tracking details, scheduling
- Review moderation (approve/hide)
- Real-time new-order notification bell
- TOTP-based two-factor authentication for admin logins

### Cross-cutting

- JWT auth for both users and admins, with admin `Role` verified on every protected admin call
- Azure Blob Storage image upload/serving (or Key Vault-resolved connection strings), with a `data:` URI fast-path for seed images
- Rate-limited auth endpoints, Helmet, CORS allow-list, mongo-sanitize
- Stripe PaymentIntents + idempotent webhook fulfillment
- Route-level code splitting (`React.lazy` + `Suspense`) in the Frontend

---

## 8. Data & Business Concepts

- **Products** support multi-variant linking (color/size/material as related Product documents), an archive flag instead of hard deletes, a free-form `specifications` string plus a structured `technical_specs` block (weight/dimensions/warranty), and Discount linkage.
- **Sales** are full orders with a status state machine, optional delivery scheduling, carrier tracking metadata, and a Stripe PaymentIntent id for reconciliation.
- **Users** hold loyalty points, an optional Stripe customer id, addresses, banks, a wishlist, reviews, and past sales; a lightweight `isGuest` flag supports checkout without a real signup.
- **Coupons** and **Discounts** are first-class entities with redemption tracking (`ReedemCoupon`) separate from the discount rule itself.
- **Reviews** are polymorphic (`targetType`/`targetId` can point at a `Product` or a `Sale`) and gated behind admin approval before they're publicly visible.

---

## 9. Security Notes (as implemented)

- Passwords stored hashed (bcryptjs); password field `select: false` on both User and Admin.
- `JWT_SECRET` required at boot — the process refuses to start without it (`validateEnv.js`).
- Stripe secret key and webhook secret only ever live in env/Key Vault; only the *publishable* key reaches the Frontend.
- Auth-sensitive routes are rate-limited (login, password reset/change, OTP, admin login/2FA).
- `express-mongo-sanitize` and Helmet enabled globally.
- Socket.IO rooms are gated by token ownership (`order:<saleId>`) or admin Role (`admins`) — not just by being connected.
- CORS restricted to the configured origin allow-list.
- `.env`, `.env.docker`, and build output are gitignored; only `.env.example` / `.env.docker.example` are tracked.
- ⚠️ A real (non-`.example`) `admin/.env` exists locally with what appear to be live Azure AD tenant/client identifiers. It's covered by the repo's `.env*` gitignore rule, but treat it as a secret — don't paste its contents anywhere, and rotate those credentials if this file is ever shared outside the local machine.

---

## 10. How to Run (Local Development)

1. **MongoDB** running locally or in Atlas. Set `MONGODB_URI` accordingly.

2. **Backend**
   ```bash
   cd Backend
   cp .env.example .env
   # Fill JWT_SECRET, Mongo/Stripe/storage config, CORS_ALLOWED_ORIGINS
   npm install
   npm run seed   # optional but recommended — seeds demo catalog + accounts
   npm start
   # → http://localhost:5000
   ```

3. **Frontend**
   ```bash
   cd Frontend
   cp .env.example .env
   # Set REACT_APP_PUBLIC_PATH / REACT_APP_IMAGE_CLOUD / REACT_APP_SOCKET_URL / Stripe publishable key
   npm install
   npm start
   # → http://localhost:3000
   ```

4. **admin**
   ```bash
   cd admin
   cp .env.example .env
   # Set REACT_APP_PUBLIC_PATH to the Backend URL
   npm install
   PORT=3001 npm start   # 3000 will already be taken by Frontend
   # → http://localhost:3001
   ```

5. **Sign in** with the seeded demo accounts:
   - Customer: `customer@torquehub.demo` / `password123`
   - Admin: `admin@torquehub.demo` / `password123`

6. **Stripe webhook (local)**
   ```bash
   stripe listen --forward-to localhost:5000/Stripe-Webhook
   # copy the printed signing secret into Backend/.env as STRIPE_WEBHOOK_SECRET
   ```

7. **Docker (Backend only, currently)**
   ```bash
   cd Backend
   cp .env.docker.example .env.docker   # fill in real values
   docker compose up --build
   ```

---

## 11. Naming & Consistency Notes

- Top-level folders mix casing: `Backend/`, `Frontend/` (capitalized) vs. `admin/` (lowercase).
- Model/route spellings preserved as-is in the source: `Whishlist.js` (registered Mongoose model name is `"Wishlist"`), `ReedemCoupon.js` (exports `CouponRedeem`), admin context endpoints `GetAllCategorys` / `GetAllAddresss` (intentionally not "corrected" — the admin `context/factory.js` calls these out explicitly so they keep matching the Backend routes byte-for-byte).
- Frontend page file `Singin.js` (routed as `/SignIn`).
- `Backend/package.json`'s `"main"` field points at a nonexistent `index.js`; the real entry point is `app.js`.
- `Frontend/deploy.yml` is a GitHub Actions workflow file sitting outside `.github/workflows/`, so it won't be picked up by GitHub Actions until moved.
- These are preserved as found in the source; this document does not rename them.

---

## 12. What Is *Not* Present

- No root-level `package.json` or workspace tooling — three independent apps, not a monorepo with shared packages.
- No `docker-compose.yml`/`Dockerfile` for the `admin` app (Backend and Frontend both have one).
- No CI workflow actually wired up under `.github/workflows/` (see §11 — `Frontend/deploy.yml` exists but isn't in the right location to run).
- No email actually sent for OTP/password-reset flows — `nodemailer` is a dependency but no mailer utility wires it up; verify this path before relying on it in production.
- MSAL/Azure AD SSO packages are installed in both the Frontend (env vars only) and admin (provider wired) but aren't used to actually gate any login flow yet.
- No GraphQL — pure REST + Socket.IO.
- No screenshots captured into the repo yet (see §Screenshots at the top).

---

## 13. Quick Reference — Key Paths

| Concern                 | Location |
|--------------------------|----------|
| API entry                | `Backend/app.js` |
| Express + Socket.IO setup | `Backend/Middlewares/Server.js`, `Socket.js` |
| Route mounting           | `Backend/Middlewares/Routes.js` |
| Auth helpers             | `Backend/utils/AuthCheck.js` |
| Shared order fulfillment  | `Backend/utils/orderFulfillment.js` |
| Product schema           | `Backend/models/Product.js` |
| Order (Sale) schema      | `Backend/models/Sale.js` |
| User schema              | `Backend/models/User.js` |
| Demo data seeder         | `Backend/seed.js` |
| Customer routes          | `Frontend/src/App.js` |
| Customer API base config | `Frontend/src/link.js` |
| Admin route gate         | `admin/src/ProtectedRoute.js` |
| Admin sidebar routes     | `admin/src/routes.js` |
| Admin entity contexts    | `admin/src/context/factory.js` |
| Admin dashboard          | `admin/src/views/admin/default/index.jsx` |
| Env templates            | `*/.env.example` |

---

## 14. Summary

**TorqueHub** is a complete, multi-app **automotive parts e-commerce** system:

- **Backend** — Express + MongoDB API with JWT auth (customer + 2FA-capable admin), Stripe payments with idempotent webhook fulfillment, Socket.IO order/admin rooms, rate limiting, and Azure-backed image storage.
- **Frontend** — Customer store with catalog + variant filtering, cart, guest or authenticated checkout, Stripe pay, wishlist, reviews, blog, live order tracking, and account management.
- **admin** — Horizon UI-based management console for catalog, orders, users, coupons, discounts, blogs, and reviews, with a partially live dashboard and real-time new-order alerts.

---
