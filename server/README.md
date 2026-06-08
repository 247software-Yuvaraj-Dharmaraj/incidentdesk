# IncidentDesk — Server

Express + TypeScript REST API with Prisma, PostgreSQL, and JWT auth.

## Setup

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL and JWT_SECRET
npm run prisma:generate
npm run prisma:migrate      # creates tables
npm run seed                # demo admin + reporter + sample data
npm run dev                 # http://localhost:4000
```

## Environment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs (≥16 chars) |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Frontend origin for CORS |
| `PORT` | Server port (default `4000`) |
| `NODE_ENV` | `development` \| `test` \| `production` |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with hot reload (tsx) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run typecheck` | Type-check without emitting |
| `npm run prisma:migrate` | Apply migrations |
| `npm run seed` | Seed demo data |
| `npm test` | Run tests (Vitest) |

## Architecture

```
routes → controllers → services → repos → Prisma → PostgreSQL
                ↑
         middleware: requireAuth · requireRole · validate · errorHandler
```

- **routes** — HTTP wiring + per-route guards
- **controllers** — thin request/response adapters
- **services** — business logic + authorization decisions
- **repos** — data access (Prisma)

## API

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/auth/signup` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | auth |
| GET | `/api/auth/me` | auth |
| GET | `/api/incidents` | auth (reporter-scoped) |
| POST | `/api/incidents` | auth |
| GET | `/api/incidents/:id` | owner/admin |
| PATCH | `/api/incidents/:id` | admin |
| GET | `/api/users` | admin |
