# BookingManager Admin

Frontend for the BookingManager hotel management platform — a modern React +
Tailwind admin dashboard with role-aware UX (**Admin / Owner / Manager**).

Talks to [`bookingmanager-api`](../bookingmanager-api) over a JWT-secured REST
API.

## Features

- 🔐 Login + self-registration (defaults to Owner role)
- 🚪 Role-based redirect after login (`/admin`, `/owner`, `/manager`)
- 🛡️ Route guards on the client + role checks on the server
- 📊 Beautiful dashboards with Recharts (area + bar + pie)
- 🏨 CRUD for Owners, Hotels, Rooms, Customers, Bookings
- 🧾 Manager workflow: confirm / check-in / check-out / cancel
- 🔍 Searchable, paginated data tables
- 🍞 Toast notifications for every action (success + error)
- 📱 Fully responsive layout (mobile-first sidebar)
- 🎨 Custom logo + favicon, beautiful purple/indigo brand

## Tech stack

- React 19 + Vite 8
- Tailwind CSS 4
- React Router 6
- Axios + small typed API client
- Recharts for charts
- lucide-react icon set
- react-hot-toast

## Quick start

```bash
# 1. install
npm install

# 2. configure env (optional — defaults to http://localhost:3000/api)
cp .env.example .env

# 3. start the API in another terminal
cd ../bookingmanager-api && npm run start:dev

# 4. start the admin
npm run dev
```

Open http://localhost:5173/. The site lands on the login page. Use accounts
created on the API (for local dev, set `BOOTSTRAP_ADMIN_*` in
`bookingmanager-api/.env` — see that README).

## Project structure

```
src/
├── api/                 # axios client + endpoint helpers
├── components/
│   ├── branding/        # Logo + LogoMark
│   ├── charts/          # Recharts wrappers
│   ├── forms/           # Reusable Room / Customer / Booking forms
│   ├── layout/          # AppLayout, Sidebar, Topbar
│   └── ui/              # Button, Input, Modal, DataTable, StatCard, etc.
├── context/AuthContext  # global auth provider + role helpers
├── hooks/               # useDashboard etc.
├── pages/
│   ├── auth/            # LoginPage, RegisterPage, AuthLayout
│   ├── admin/           # AdminDashboard, Owners, Hotels, Managers, Analytics
│   ├── owner/           # OwnerDashboard, OwnerHotelsPage
│   ├── manager/         # ManagerDashboard
│   └── shared/          # RoomsPage, CustomersPage, BookingsPage
├── routes/RequireAuth   # role-aware route guards
├── App.jsx              # router + provider wiring
└── main.jsx
```

## Configuration

`.env` (or `.env.local`):

```env
VITE_API_URL=http://localhost:3000/api
```

Vite also proxies `/api` to `http://localhost:3000` in dev (see `vite.config.js`),
so you can leave `VITE_API_URL` unset and the SPA will work behind the proxy.

## Scripts

```bash
npm run dev       # start dev server on :5173
npm run build     # production build to dist/
npm run preview   # preview the build
npm run lint      # eslint
```

## Role capabilities (UI)

| Page                      | Admin | Owner | Manager |
| ------------------------- | :---: | :---: | :-----: |
| Overview / dashboard      |  ✅   |  ✅   |   ✅    |
| Owners CRUD               |  ✅   |       |         |
| Hotels (all platform)     |  ✅   |       |         |
| Hotels (own)              |  ✅   |  ✅   |         |
| Rooms                     |  ✅   |  ✅   |  ✅¹    |
| Customers                 |  ✅   |  ✅   |   ✅    |
| Bookings + check-in/out   |  ✅   |  ✅   |   ✅    |
| Analytics                 |  ✅   |  📈²  |   📈²   |

¹ Manager sees a read-only view of their assigned hotel's rooms.<br>
² Manager / Owner see analytics tiles + trend charts on their own dashboard.
