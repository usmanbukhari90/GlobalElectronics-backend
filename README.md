# GlobalElectronics — Backend API

REST API powering the GlobalElectronics storefront and admin dashboard. Handles products, orders, reviews, notifications, analytics, authentication, and file uploads.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Database & Auth:** Supabase (Postgres)
- **Email:** Nodemailer (order confirmation emails)

## Features

- Product catalog CRUD with admin-only write access
- Order creation, status updates, and order confirmation emails
- Customer review submission and average rating calculation
- Admin notification system
- Basic sales analytics endpoints
- Image upload handling
- Role-based auth middleware (admin vs. customer)
- One-off migration script for seeding/moving data into Supabase

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm
- A Supabase project (Postgres database + service role key)

### Installation

```bash
git clone https://github.com/usmanbukhari90/GlobalElectronics-backend.git
cd GlobalElectronics-backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, keep secret) |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email credentials for order confirmation emails |

### Run Locally

```bash
npm run dev
```

The API will be available at `http://localhost:5000` (or the port set in `PORT`).

### Build for Production

```bash
npm run build
npm start
```

## API Routes

| Route | Description |
|---|---|
| `/api/auth` | Login and session/role verification |
| `/api/products` | Product listing, detail, create, update, delete |
| `/api/orders` | Order creation, listing, status updates |
| `/api/reviews` | Review submission and retrieval |
| `/api/notifications` | Admin notification list and read status |
| `/api/analytics` | Sales and order summary data |
| `/api/upload` | Image upload endpoint |

## Project Structure

src/
├── data/ # Local seed/fallback data
├── lib/ # Supabase client, DB helpers, email helper
├── middleware/ # Auth and role-check middleware
├── routes/ # Express route handlers
├── scripts/ # One-off scripts (e.g. migrate.ts)
├── types/ # Shared TypeScript types
└── index.ts # App entry point


## Deployment

This API is deployed separately from the frontend. Ensure all environment variables are configured on the hosting provider before deploying, and that `CLIENT_URL` matches the deployed frontend origin for CORS to work correctly.

## Related Repositories

- [Frontend](https://github.com/usmanbukhari90/GlobalElectronics-frontend)

## License

This project is proprietary and not licensed for public use or distribution.