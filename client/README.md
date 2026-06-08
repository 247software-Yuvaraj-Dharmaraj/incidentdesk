# IncidentDesk — Client

React + TypeScript + Vite frontend with Tailwind CSS, TanStack Query, and React Hook Form.

## Setup

```bash
npm install
cp .env.example .env        # set VITE_API_URL (default http://localhost:4000)
npm run dev                 # http://localhost:5173
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Structure

```
src/
├── api/          # axios instance + endpoint functions
├── components/   # shared UI (badges, layout, route guards)
├── context/      # auth context
├── hooks/        # TanStack Query hooks (incidents, users)
├── pages/        # route components
├── schemas/      # Zod form schemas
└── types/        # shared types
```

## Notable patterns

- **Auth** via httpOnly cookie + `AuthProvider`; `/me` hydrates session on load
- **Protected routes** with optional role gating
- **Optimistic updates** on incident edits (instant UI, rollback on error)
- **Infinite scroll** list via `useInfiniteQuery` + cursor pagination
