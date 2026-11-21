# FixMate — Full-Stack Service Booking & Repair Platform

FixMate is a full-stack repair and service booking platform built with **Next.js**, **Express.js**, and **MongoDB**. It connects customers with verified technicians and provides role-based dashboards for customers, technicians, and administrators, complete with JWT authorization, role access control, job status tracking, and Stripe payment verification.

## Live Links

- **Live Frontend:** [https://fixmate-client-side.vercel.app/](https://fixmate-client-side.vercel.app/)
- **Backend API:** [https://fixmate-server-side.vercel.app](https://fixmate-server-side.vercel.app)

## Key Features

- **Authentication & Role-Based Access Control (RBAC)**
  - Session handling with BetterAuth and JWT token synchronization (`/api/auth/jwt`).
  - Role-specific access protection (`401` for unauthenticated requests, `403` for unauthorized roles or cross-user data access) across **Customer**, **Technician**, and **Admin** workflows.
- **Customer Portal**
  - Browse approved and available repair services with search, category, mode, and price sorting.
  - Inspect service details and technician summaries before placing a booking request (`POST /api/bookings`).
  - Track personal bookings (`GET /api/bookings/my`), cancel `requested` bookings (`PATCH /api/bookings/:id/cancel`), pay for completed jobs via Stripe (`POST /api/payments/create-checkout-session` & `GET /api/payments/verify`), and view payment history.
- **Technician Portal**
  - Create, update, toggle availability, and delete services (`POST /services`, `PATCH /services/:id`, `PATCH /services/:id/availability`, `DELETE /services/:id`).
  - Manage incoming booking requests and follow the job status pipeline (`requested` → `accepted` → `in-progress` → `completed`, or `rejected`) with final amount calculation upon completion.
- **Admin Dashboard**
  - Overview metrics for total users, total technicians, and pending services.
  - Moderate technician services (`approved` / `rejected` / `pending`), manage user roles (with self-role-change restriction), inspect all bookings, and review all payment transactions with total revenue.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, BetterAuth, Lucide React, Sonner
- **Backend:** Node.js, Express.js, MongoDB, JWT (`jsonwebtoken`), Stripe SDK, CORS
- **Deployment:** Vercel

## Environment Variables

### Frontend (`.env.local` / Vercel)
- `NEXT_PUBLIC_SERVER_BASE_URL` — Backend API base URL (without trailing slash)
- `NEXT_PUBLIC_APP_URL` — Frontend application URL
- BetterAuth & database environment variables configured in your Next.js environment

### Backend (`.env` / Vercel)
- `PORT` — Server port (default: `5000`)
- `DB_URL` — MongoDB connection string
- `JWT_SECRET` — Secret key for signing and verifying JWT tokens
- `STRIPE_SECRET_KEY` — Stripe secret key for checkout sessions and payment verification
- `CLIENT_URL` — Allowed frontend client URL
- `ALLOWED_ORIGINS` — Comma-separated allowed CORS origins

## Local Setup

1. **Clone the client repository**
   ```bash
   git clone [https://github.com/koli0067/fixmate-client.git](https://github.com/koli0067/fixmate-client.git)
   cd fixmate-client
