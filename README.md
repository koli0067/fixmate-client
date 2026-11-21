# FixMate — Full-Stack Service Booking & Repair Platform

## Project Name
**FixMate**

## Purpose
FixMate is a full-stack home repair and service booking platform designed to connect customers with verified technicians in a reliable, transparent workflow. The platform streamlines service discovery, booking requests, technician job status progression (`requested` → `accepted` → `in-progress` → `completed`), Stripe payment processing, and administrative moderation under strict role-based access control.

## Live URL
- **Live Client Website:** [https://fixmate-client-side.vercel.app/](https://fixmate-client-side.vercel.app/)
- **Live Server API:** [https://fixmate-server-side.vercel.app](https://fixmate-server-side.vercel.app)

## Admin Credentials (Demo / Test Account)
> **Note:** These credentials are provided strictly for testing and evaluation purposes.

- **Role:** Admin
- **Email:** `jim@gmail.com`
- **Password:** `Jim28016`

## Key Features
- **Authentication & Role-Based Access Control (RBAC):**
  - Secure email/password authentication powered by BetterAuth alongside custom JWT verification (`Bearer` token) on protected Express routes.
  - Strict role-based authorization (`401 Unauthorized` & `403 Forbidden`) separating **Customer**, **Technician**, and **Admin** permissions and preventing cross-user data access.
- **Customer Portal:**
  - Browse approved and available repair services with real-time search, category filtering, service mode filtering, and price sorting.
  - View detailed service information and verified technician profiles before submitting booking requests.
  - Track personal booking statuses, cancel pending (`requested`) bookings, complete secure online payments via Stripe Checkout for finished jobs, and view payment history.
- **Technician Portal:**
  - Create, edit, delete, and toggle availability (`isAvailable`) for personal repair services.
  - Manage incoming customer booking requests and update job progress through a strict status pipeline (`requested` → `accepted` → `in-progress` → `completed` / `rejected`) with final billing calculation.
- **Admin Dashboard:**
  - View platform-wide overview statistics (Total Users, Total Technicians, Pending Services).
  - Approve or reject technician-submitted services, manage user roles (with self-role-modification protection), monitor all platform bookings, and audit all payment transactions alongside total revenue.

## NPM Packages Used

### Client (`fixmate-client`)
- `next` — React framework with App Router for frontend pages and API routes
- `react` & `react-dom` — Core UI library
- `better-auth` — Authentication and session management
- `lucide-react` — Clean icon library across dashboards and forms
- `sonner` — Toast notifications for user feedback
- `tailwindcss` — Utility-first CSS framework for responsive styling
- `typescript` — Static type checking

### Server (`fixmate-server`)
- `express` — RESTful backend web framework
- `mongodb` — Official MongoDB driver for database operations
- `jsonwebtoken` — JWT signing and verification for route protection
- `stripe` — Stripe Checkout session creation and payment verification
- `cors` — Cross-Origin Resource Sharing configuration
- `dotenv` — Environment variable management

## Local Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/koli0067/fixmate-client.git](https://github.com/koli0067/fixmate-client.git)
   cd fixmate-client
