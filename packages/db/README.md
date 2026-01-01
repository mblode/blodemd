# @repo/db

Shared Prisma client and schema for neue.

## Commands

```bash
npm run prisma:generate --workspace=packages/db
npm run prisma:migrate --workspace=packages/db
npm run prisma:deploy --workspace=packages/db
```

## Seed data

```bash
npx prisma db execute --file packages/db/prisma/seed.sql --schema packages/db/prisma/schema.prisma
```

If you prefer `psql`, this also works:

```bash
psql "$DATABASE_URL" -f packages/db/prisma/seed.sql
```

## Local Supabase workflow

Supabase runs the database locally, but Prisma migrations are the source of truth.

```bash
# from repo root
supabase start

# use the DATABASE_URL from `supabase status`
npm run prisma:deploy --workspace=packages/db
npx prisma db execute --file packages/db/prisma/seed.sql --schema packages/db/prisma/schema.prisma
```
