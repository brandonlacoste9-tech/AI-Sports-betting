# BetEdge AI

AI-powered sports betting tips SaaS — daily picks for **NFL, NBA, MLB, NHL, UFC, Soccer** with edge analysis, confidence scores, bankroll tools, and Stripe subscriptions.

> For entertainment purposes only. Gambling involves risk. 18+/21+ only.

## Stack

- **Next.js 15+** (App Router) + TypeScript
- **Tailwind CSS** (dark navy + neon green)
- **Neon PostgreSQL** + **Prisma**
- **Auth.js** (credentials + optional Google)
- **Stripe** subscriptions (Free / Basic $19 / Pro $49)
- **xAI Grok** pick generation (mock fallback without key)
- **The Odds API** optional (mock slate without key)

## Quick start

```bash
cd AI-Sports-betting
cp .env.example .env.local
# fill DATABASE_URL + AUTH_SECRET at minimum

npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed accounts

| Role  | Email            | Password           |
|-------|------------------|--------------------|
| Admin | `admin@betedge.ai` (or `ADMIN_EMAIL`) | `ChangeMeAdmin123!` (or `ADMIN_PASSWORD`) |
| Demo  | `demo@betedge.ai` | `DemoUser123!`     |

## Environment

See `.env.example` for all variables.

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Neon connection string |
| `AUTH_SECRET` | Yes | `openssl` / node random 32 bytes |
| `XAI_API_KEY` | No | Mock picks if empty |
| `ODDS_API_KEY` | No | Mock odds if empty |
| `STRIPE_*` | No | Checkout disabled until set |
| `AUTH_GOOGLE_*` | No | Google OAuth |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Prisma generate + production build |
| `npm run db:push` | Push schema to Neon |
| `npm run db:seed` | Seed admin, demo, sample picks |
| `npm run db:studio` | Prisma Studio |

## Product tiers

| Plan | Price | Access |
|------|-------|--------|
| Free | $0 | 1 pick/day, limited history |
| Basic | $19/mo | Unlimited picks + analytics |
| Pro | $49/mo | + premium high-edge picks |

## Deploy (Vercel + Neon)

1. Create Neon DB → set `DATABASE_URL`
2. Import repo to Vercel → set env vars
3. `prisma db push` via build (`postinstall` generates client)
4. Stripe webhook → `https://YOUR_DOMAIN/api/stripe/webhook`
5. Optional: set `CRON_SECRET` for `/api/cron/generate-picks` (daily 14:00 UTC in `vercel.json`)

## License

See `LICENSE`.
