# TransLedger

A modern digital transport record book for tracking trips, biltis, and freight payments. Built as a desktop application using **Next.js** and **Electron** with a local **SQLite** database.

## Features

- **Trip Management** — Create, view, filter, and manage transport trips with details like truck number, route, weight, and bilti tracking.
- **Company Directory** — Maintain records of material and truck companies with contact details and employee information.
- **Payment Ledger** — Track freight payments, advances, commissions, TDS, loading/unloading charges, and extra charges per trip party.
- **Refund Ledger** — Manage and record refund details against payments, with PDF report generation.
- **Reports** — Generate insights and summaries from trip and payment data.
- **Forms** — Structured forms for data entry across all modules.
- **PDF Export** — Generate PDF reports for refund ledgers and trip summaries.
- **Dark/Light Theme** — System-aware theme switching with manual override.
- **Offline-First** — Runs entirely offline with a local SQLite database — no internet required.

## Tech Stack

| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org/) (App Router)       |
| Desktop      | [Electron](https://www.electronjs.org/)               |
| Database     | [SQLite](https://www.sqlite.org/) via better-sqlite3  |
| ORM          | [Prisma 7](https://www.prisma.io/)                    |
| UI           | [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS 4](https://tailwindcss.com/) |
| State        | [Zustand](https://zustand.docs.pmnd.rs/)              |
| Data Fetching| [TanStack Query](https://tanstack.com/query)          |
| Forms        | [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) |
| PDF          | [@react-pdf/renderer](https://react-pdf.org/)         |
| Language     | TypeScript                                            |

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- npm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/s-adi-dev/TransLedger.git
cd TransLedger
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

Run Prisma migrations to initialize the SQLite database:

```bash
npx prisma migrate deploy
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start the application

Run the Next.js dev server and Electron together:

```bash
npm run dev
```

This starts the Next.js server on `http://localhost:3000` and opens the Electron window once the server is ready.

## Scripts

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Start Next.js + Electron in development mode     |
| `npm run dev:next` | Start only the Next.js dev server                |
| `npm run build`    | Build the Next.js application for production     |
| `npm run start`    | Start the production Next.js server              |
| `npm run lint`     | Run ESLint                                       |

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── (panel)/          # Main application pages
│   │   ├── trips/        # Trip management
│   │   ├── companies/    # Company directory
│   │   ├── payment-ledger/
│   │   ├── refund-ledger/
│   │   ├── forms/
│   │   └── reports/
│   └── api/              # REST API routes
│       ├── trips/
│       ├── companies/
│       ├── employees/
│       ├── payments/
│       └── refunds/
├── components/           # React components
│   ├── layout/           # Sidebar, Navbar
│   ├── pdf/              # PDF report templates
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components (Radix-based)
├── electron/             # Electron main process
├── generated/            # Prisma generated client
├── hooks/                # Custom React hooks
├── lib/                  # Utilities, Prisma client, config
├── prisma/               # Schema & migrations
├── query/                # TanStack Query hooks
├── services/             # API service functions
├── stores/               # Zustand state stores
└── validators/           # Zod validation schemas
```

## Database Schema

The application manages the following core entities:

- **Trip** — Transport trip records with route, weight, truck, and date info.
- **Bilti** — Bilti (receipt) tracking with status workflow (pending → received → submitted).
- **PartyPaymentDetails** — Freight payment records for material and truck parties per trip.
- **RefundDetails** — Refund records linked to payments.
- **Company** — Material and truck companies.
- **Employee** — Employees associated with companies.

## License

GNU General Public License v3.0 - see [LICENSE](./LICENSE) file for details.
