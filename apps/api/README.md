# API (Express + Prisma + PostgreSQL)

Quick steps to run locally:

1. Set your `DATABASE_URL` in `apps/api/.env` (Postgres connection string).
2. Install root deps and workspace deps:

```bash
pnpm install
```

3. Run Prisma migrations and generate client:

```bash
cd apps/api
pnpm db:migrate
```

4. Start the server in development:

```bash
pnpm dev
```

Routes:
- GET /users
- GET /users/:id
- POST /users  { name, email }
- PUT /users/:id
- DELETE /users/:id
