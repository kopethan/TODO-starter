# TODO Backend Starter

Starter backend for **TODO**, your trust-aware decision platform.

This base project is built around four ideas:
- **Entities**: objects, services, situations, scam patterns, brands, concepts
- **Structured knowledge**: each entity uses reusable sections like definition, normal process, dangers, red flags, and what to do
- **Experience reports**: users can submit what happened to them in a structured way
- **Patterns + history**: repeated reports can later become AI-assisted pattern cards and timeline events

## Stack
- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Zod validation

## Current scope
The starter already includes:
- Prisma schema for the core TODO data model
- Prisma config for PostgreSQL
- reusable Prisma client setup
- a seed file with sample entities, sections, trust data, one scam report, and one early pattern
- minimal REST routes for health, entities, and reports
- documentation in the `docs/` folder
- `admin-ui/`, a separate Next.js web app starter for the public web shell and first admin workspace

## Project structure
```text
TODO-backend-starter/
├── admin-ui/
├── docs/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── config/
│   ├── generated/
│   ├── lib/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
├── prisma.config.ts
├── README.md
└── tsconfig.json
```

## Quick start
1. Copy the environment file.
```bash
cp .env.example .env
```

2. Install dependencies.
```bash
npm install
```

3. Generate the Prisma client.
```bash
npm run prisma:generate
```

4. Create the first migration.
```bash
npm run prisma:migrate -- --name init_todo_core
```

5. Seed the database.
```bash
npm run db:seed
```

6. Start the API in development mode.
```bash
npm run dev
```

The API will be available at:
```text
http://localhost:4000/api
```

## Web app starter
A separate web app now lives in `admin-ui/`.

### Included routes
#### Public
- `/`
- `/entities/[slug]`
- `/reports`

#### Admin
- `/admin/entities`
- `/admin/entities/new`
- `/admin/entities/[id]`
- `/admin/reports`
- `/admin/reports/[id]`

### Run the web app
```bash
cd admin-ui
cp .env.example .env.local
npm install
npm run dev
```

Default API target:
```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

## Available API routes
### Health
- `GET /api/health`

### Entities
- `GET /api/entities`
- `GET /api/entities/id/:id`
- `GET /api/entities/:slug`
- `POST /api/entities`
- `PATCH /api/entities/id/:id`
- `DELETE /api/entities/id/:id`
- `POST /api/entities/:entityId/sections`
- `PATCH /api/entities/:entityId/sections/:sectionId`
- `DELETE /api/entities/:entityId/sections/:sectionId`

### Reports
- `GET /api/reports`
- `GET /api/reports/:id`
- `POST /api/reports`
- `PATCH /api/reports/:id`
