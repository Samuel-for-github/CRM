# AI-Powered WooCommerce CRM

A Next.js 14 CRM for managing WooCommerce customers, orders, products, and
follow-up tasks. The application supports MongoDB persistence, WooCommerce
REST API synchronization, webhook updates, an AI assistant, and a demo mode
when external services are not configured.

## Planning and execution video

[Watch the planning and execution video](https://drive.google.com/drive/folders/1H4_oUN39TqqfMzbekkSv8KwFbNdsBc9i?usp=sharing)

## Features

- Admin login with an HTTP-only JWT session cookie.
- Dashboard metrics for customers, orders, products, sales, and tasks.
- WooCommerce product catalog with:
  - Search by name, SKU, or category.
  - Stock-status filtering.
  - Loading, empty, error, and retry states.
  - Product count and out-of-stock count.
- Customer, order, product, and task management pages.
- MongoDB persistence through Mongoose.
- WooCommerce REST API access using OAuth 1.0a.
- Initial synchronization for customers, orders, and products.
- Product, customer, and order webhook processing.
- AI customer insights and assistant routes.
- Demo data fallback when required services are unavailable.
- Vitest unit tests and Playwright end-to-end test configuration.

## Technology

- Next.js 14 App Router
- React 18 and TypeScript
- Tailwind CSS
- MongoDB and Mongoose
- WooCommerce REST API
- OAuth 1.0a
- Zod validation
- JWT sessions with `jose`
- Vitest and Playwright

## Project structure

```text
CRM/
├── src/
│   ├── agent/                 AI agent executor and tools
│   ├── app/                   App Router pages and API routes
│   ├── components/            Shared layout and UI components
│   ├── lib/                   Auth, database, environment, and API helpers
│   ├── models/                Mongoose models
│   ├── services/              Business logic and integrations
│   ├── tests/                 Automated tests
│   └── types/                 Type declarations
├── .env.local                 Local secrets; create this file yourself
├── package.json
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Requirements

- Node.js 18.17 or newer.
- npm.
- A MongoDB deployment, such as MongoDB Atlas.
- A WooCommerce store with REST API credentials.
- Optional Hugging Face credentials for AI features.

## Installation

From the `CRM` directory:

```powershell
npm install
```

## Environment configuration

Create `.env.local` in the project root:

```env
NODE_ENV=development

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

WOO_STORE_URL=https://your-store.example
WOO_CONSUMER_KEY=ck_your_consumer_key
WOO_CONSUMER_SECRET=cs_your_consumer_secret
WOO_WEBHOOK_SECRET=your_webhook_secret

AUTH_SECRET=replace-with-at-least-16-random-characters
APP_BASE_URL=http://localhost:3000

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<bcrypt-hash>

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=deepseek/deepseek-r1:free
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=AI Powered WooCommerce CRM
```

Only `MONGODB_URI`, `WOO_STORE_URL`, `WOO_CONSUMER_KEY`, and
`WOO_CONSUMER_SECRET` are required for live MongoDB and WooCommerce
operation. `OPENROUTER_API_KEY` is required for live AI responses. Other
values are optional depending on the feature being used.

Environment files must be located at the project root, not in `src/`.
Next.js loads `.env.local` automatically when the development server starts.
Restart the server after changing environment variables.

### Credential safety

- Never commit `.env`, `.env.local`, or production environment files.
- Never paste credentials into source files, screenshots, logs, or issues.
- Rotate any WooCommerce, MongoDB, or AI credential that has been exposed.
- Use deployment-platform environment settings in production.
- Do not use the example values above as real credentials.

## Running the application

Development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build and server:

```powershell
npm run build
npm start
```

## Authentication

Protected pages and API routes use the `crm_admin_session` HTTP-only cookie.
The session contains an administrator role and expires after seven days.

The login flow is:

1. Submit credentials to `POST /api/auth/login`.
2. The server validates the credentials.
3. The server creates a signed JWT.
4. The JWT is stored in an HTTP-only cookie.
5. Protected pages call `getSessionFromCookies()`.
6. Unauthenticated users are redirected to `/login` or receive `401`.

The demo login credentials are defined by the application’s demo auth
configuration. Change the credentials and `AUTH_SECRET` before deploying.

## MongoDB behavior

The database helper in `src/lib/db.ts`:

- Reads `MONGODB_URI` from the validated environment.
- Connects to the `crm` database.
- Reuses a cached Mongoose connection during development hot reloads.
- Returns the cached connection when it is already available.

MongoDB creates a database only after the first collection or document is
written. A successful connection by itself does not make an empty database
visible in MongoDB Atlas.

The main MongoDB models are:

- `AdminUser`
- `Customer`
- `CustomerNote`
- `FollowUpTask`
- `Order`
- `Product`
- `SyncLog`

## WooCommerce integration

WooCommerce requests use the following configuration:

- `WOO_STORE_URL`: Store URL, for example `https://shop.example`.
- `WOO_CONSUMER_KEY`: WooCommerce REST API consumer key.
- `WOO_CONSUMER_SECRET`: WooCommerce REST API consumer secret.
- `WOO_WEBHOOK_SECRET`: Secret used to verify webhook signatures.

The REST client signs requests with OAuth 1.0a and calls the WooCommerce
`wc/v3` API.

### Product loading and persistence

When the Products page loads or the user clicks **Refresh catalog**:

1. The browser calls `GET /api/woo/sync?scope=products`.
2. WooCommerce products are fetched page by page.
3. Each product is upserted into MongoDB using `wooProductId`.
4. The browser calls `GET /api/woo/products`.
5. The current catalog is rendered in the Products page.

The product API also upserts fetched products before returning them. This
keeps the dashboard count and the product catalog backed by the same
persisted data.

### Webhook updates

WooCommerce product, customer, and order webhooks are handled by:

```text
POST /api/woo/webhooks
```

Webhook signatures are checked before events are processed. Product events
upsert the matching MongoDB product, so changes made in WooCommerce can be
reflected without a full catalog sync.

## Dashboard behavior

The dashboard is a Server Component because it reads authentication cookies
and server-side CRM data. Client-only behavior is isolated in
`src/components/dashboard/woo-products.tsx`.

The dashboard:

- Loads CRM metrics from MongoDB or demo state.
- Shows customers, orders, sales, and open tasks.
- Refreshes the product count from the WooCommerce product endpoint.
- Persists products encountered by that endpoint into MongoDB.
- Displays recent WooCommerce products in a client-side widget.
- Links the product metric to `/products`.

The count may initially show the server-rendered MongoDB count and then update
after the browser finishes the live WooCommerce request.

## API routes

### Authentication

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

### CRM resources

```text
GET    /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id
GET    /api/customers/:id/notes
POST   /api/customers/:id/notes

GET    /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id

GET    /api/products
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id

GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

### WooCommerce and AI

```text
GET  /api/woo/products
GET  /api/woo/sync?scope=customers|orders|products|all
POST /api/woo/sync
POST /api/woo/webhooks

POST /api/ai/ask
GET  /api/ai/customer/:id
POST /api/agent
```

Protected routes require a valid CRM session. The sync route accepts a JSON
body such as:

```json
{
  "scope": "products"
}
```

## Demo mode

The application can use in-memory demo data when the required live
configuration is incomplete. Demo mode is useful for viewing the interface
without MongoDB or WooCommerce.

Live mode requires all of the following:

- `MONGODB_URI`
- `WOO_STORE_URL`
- `WOO_CONSUMER_KEY`
- `WOO_CONSUMER_SECRET`

Demo state is not persistent and is reset when the server process restarts.

## Testing and validation

Run unit tests:

```powershell
npm test
```

Run tests in watch mode:

```powershell
npm run test:watch
```

Run the production type-check and build:

```powershell
npm run build
```

Run end-to-end tests:

```powershell
npm run test:e2e
```

Run linting if the project’s installed Next.js version provides the command:

```powershell
npm run lint
```

## Troubleshooting

### `Missing WooCommerce environment variables`

Check that the variables are named exactly:

```env
WOO_STORE_URL=
WOO_CONSUMER_KEY=
WOO_CONSUMER_SECRET=
```

Check that `.env.local` is in the `CRM` root directory, then restart
`npm run dev`.

### MongoDB says the database does not exist

MongoDB creates databases lazily. Run a product, customer, or order sync to
perform the first write. Then refresh MongoDB Atlas.

### MongoDB URI parsing errors

The URI must use exactly two slashes after the scheme:

```text
mongodb+srv://username:password@cluster.mongodb.net/
```

If the password contains reserved URL characters, URL-encode them.

### Dashboard count is zero while WooCommerce has products

Open the dashboard while authenticated and wait for the product widget to
finish loading. The product endpoint synchronizes the catalog and then
refreshes the count. If it remains zero, inspect the browser network response
for `401`, WooCommerce authentication errors, or a failed MongoDB write.

### `next/headers` Server Component error

Do not add `'use client'` to pages that import `getSessionFromCookies()` or
other server-only helpers. Keep hooks such as `useEffect` in a child Client
Component, as done by `WooProducts`.

### Port 3000 is already in use

Stop the existing development server or use the alternate port printed by
Next.js. Only one server should be used when checking environment changes.

## Operational notes

- Product synchronization currently upserts records but does not delete
  products removed from WooCommerce.
- WooCommerce remains the source of truth for product, customer, and order
  data.
- MongoDB stores CRM-friendly mappings and synchronization metadata.
- Sync logs are stored in the `SyncLog` collection.
- Avoid logging full API responses or environment values in production.
