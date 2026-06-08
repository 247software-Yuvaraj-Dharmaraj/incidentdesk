# IncidentDesk

A full-stack incident & request management tracker with role-based access control, built as a production-style demonstration of a modern React + Node + PostgreSQL stack.

> **Live demo:** _coming soon_
> **Demo logins:** `admin@incidentdesk.dev / Admin123!` · `reporter@incidentdesk.dev / Reporter123!`

## Features

- 🔐 **JWT authentication** — self-built, with bcrypt hashing and httpOnly-cookie sessions
- 👥 **Role-based access control** — Admin vs Reporter, enforced in API middleware, service layer, and reporter-scoped queries
- 📋 **Incident management** — create, list, filter, and track incidents and requests
- ⚡ **Optimistic updates** — status/priority changes apply instantly and roll back on error
- 📜 **Audit trail** — every admin change is recorded (who, what, old → new) in a DB transaction
- ♾️ **Cursor pagination** — efficient infinite-scroll list
- 🛡️ **Rate limiting & validation** — throttled auth endpoints, Zod-validated requests

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod |
| Backend | Node, Express, TypeScript, Prisma, JWT, Zod |
| Database | PostgreSQL |
| Tooling | Vitest, GitHub Actions |

## Architecture

```
┌──────────────┐   HTTPS / JSON (httpOnly cookie)   ┌──────────────┐      ┌────────────┐
│   Client     │ ─────────────────────────────────► │   Server     │ ───► │ PostgreSQL │
│ React + Vite │ ◄───────────────────────────────── │ Express API  │      │  (Prisma)  │
└──────────────┘                                     └──────────────┘      └────────────┘

Server: routes → controllers → services → repos → Prisma
        guarded by requireAuth · requireRole · validate · errorHandler
```

## Getting Started

Prerequisites: Node ≥ 22, a PostgreSQL database (e.g. [Neon](https://neon.tech)).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env          # set DATABASE_URL + JWT_SECRET
npm run prisma:migrate
npm run seed
npm run dev                    # http://localhost:4000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env           # VITE_API_URL=http://localhost:4000
npm run dev                    # http://localhost:5173
```

See [`server/README.md`](./server/README.md) and [`client/README.md`](./client/README.md) for details.

## Project Structure

```
incidentdesk/
├── client/   # React + Vite frontend
└── server/   # Express + Prisma API
```

## Future Enhancements

- Real-time updates (WebSockets)
- File attachments on incidents
- Email notifications
- Full-text search

## License

[MIT](./LICENSE) © Yuvaraj Dharmaraj
