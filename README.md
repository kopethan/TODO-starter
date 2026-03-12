# TODO Platform Monorepo

This repository is organized around separate apps for the API, the public web experience, and the admin workspace.

## Repository layout

```text
TODO/
├── apps/
│   ├── api/
│   ├── web/
│   ├── admin/
│   └── mobile/
├── docs/
├── packages/
│   ├── api-client/
│   ├── config/
│   ├── types/
│   └── ui/
├── .env.example
├── package.json
└── README.md
```

## Apps

- `apps/api`: Express + Prisma backend.
- `apps/web`: public-facing web app only.
- `apps/admin`: admin workspace only.
- `apps/mobile`: placeholder for the future mobile client.

## Packages

- `packages/ui`: shared UI primitives, badges, providers, and formatting helpers.
- `packages/types`: shared frontend DTOs and enum arrays.
- `packages/api-client`: shared `apiRequest()` helper.
- `packages/config`: shared TypeScript base configs.

## Quick start

### 1. Install workspace dependencies

```bash
npm install
```

### 2. Configure env files

API:
```bash
cp apps/api/.env.example apps/api/.env
```

Public web:
```bash
cp apps/web/.env.example apps/web/.env.local
```

Admin web:
```bash
cp apps/admin/.env.example apps/admin/.env.local
```

### 3. Generate Prisma client and migrate the database

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init_todo_core
npm run db:seed
```

### 4. Run the apps

API:
```bash
npm run dev:api
```

Public web:
```bash
npm run dev:web
```

Admin web:
```bash
npm run dev:admin
```

Default local URLs:
- API: `http://localhost:4000/api`
- Public web: `http://localhost:3000`
- Admin web: `http://localhost:3001`

## Why this structure is better

- The public site and the admin UI no longer live inside the same Next.js app.
- The admin UI can be deployed behind a separate internal domain or auth wall.
- Shared UI, frontend types, and API helpers now live in reusable packages.
- The future mobile app has a clear place in the repo.

## Security note

The repo split removes the old public/admin route coupling. You should still add real authentication and authorization before shipping the admin app to production.
