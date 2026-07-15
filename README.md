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
| Free | $0 | 1 pick/day, limited history, Odds API 100/day |
| Basic | $19/mo | Unlimited picks, line moves, Odds API 2k/day |
| Pro | $49/mo | Premium picks, Odds API 20k/day |

## Odds platform (Phase 2 mix)

| Surface | Path | Notes |
|---------|------|--------|
| Public board | `/odds` | Free, SEO-friendly |
| Line moves | `/line-moves` | Basic/Pro |
| API docs | `/docs/api` | Developer guide |
| Odds API | `GET /api/v1/odds` | Bearer `be_live_…` |
| Line moves API | `GET /api/v1/line-moves` | Basic/Pro |
| Ingest cron | `/api/cron/ingest-odds` | Every 4h (configure host) |
| Admin ingest | Admin → **Ingest odds snapshots** | Manual refresh |

API keys are created under **Settings** (hashed at rest; raw key shown once).

## Production URL

**https://www.betedge-ai.com** (Netlify + custom domain)

Set `NEXT_PUBLIC_APP_URL=https://www.betedge-ai.com` in production.

## Deploy (Netlify + Neon)

1. Create Neon DB → set `DATABASE_URL`
2. Connect repo on Netlify → set env vars
3. `prisma generate` runs on build (`postinstall`)
4. Stripe webhook → `https://www.betedge-ai.com/api/stripe/webhook`
5. Optional: set `CRON_SECRET` for `/api/cron/generate-picks` and `/api/cron/ingest-odds`

## License

See `LICENSE`.
