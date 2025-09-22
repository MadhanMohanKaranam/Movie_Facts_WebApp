# Movie Facts App

Movie Facts is a Next.js application that lets users sign in with Google, save their favourite film, and receive AI-generated trivia each time they visit. It uses Prisma with PostgreSQL, integrates TMDB for movie discovery and recommendations, and taps OpenAI for bite-sized fun facts.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **Auth**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL via Prisma ORM
- **Movie Data**: TMDB v3/v4 APIs
- **AI Fun Facts**: OpenAI Responses / Chat Completions API

## Features

- landing and dashboard with responsive hero/backdrop imagery
- Google sign-in; first-time users choose a favourite movie from TMDB search results
- Favourite movie metadata (title, TMDB ID, poster, backdrop) stored in Postgres
- AI-powered “Fun Fact” card refreshed on demand via OpenAI
- Personalised “Because you liked…” carousel using TMDB recommendations

## Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)
- TMDB API key (v3 key or v4 read token)
- Google OAuth credentials
- OpenAI API key with access to the chosen model (default `gpt-4o-mini`)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` (or this section) into `.env` and fill in your values:
   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/movie_facts"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   NEXTAUTH_SECRET="generate-a-long-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   OPENAI_API_KEY="sk-..."
   TMDB_API_KEY="your_tmdb_v3_key"            # or "Bearer YOUR_V4_TOKEN"
   OPENAI_MODEL="gpt-4o-mini"                 # optional override, comma-separated fallbacks supported
   ```

3. Apply Prisma schema changes (creates tables/columns):
   ```bash
   npx prisma migrate dev --name init
   ```
   For existing databases after schema updates, run the latest migration or `npx prisma db push` if you prefer schema-sync without history.

4. Generate the Prisma client (automatically run during migrate, but available separately):
   ```bash
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   Visit <http://localhost:3000>.

## TMDB & OpenAI Notes

- TMDB requests respect either a v3 API key (appends `api_key` query param) or a v4 bearer token (set the env var to `Bearer <token>`).
- Fun facts call OpenAI with higher temperature and random request IDs to encourage variety. Ensure the account has quota; a 429 response will surface a friendly message on the card.

## Running Prisma Studio

Inspect or edit data visually with:
```bash
npx prisma studio
```

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |

## Deployment

For Vercel or other platforms:
- Set all required environment variables in the hosting dashboard.
- Use `prisma migrate deploy` on deploy to run unapplied migrations.
- Provide the appropriate `DATABASE_URL` (e.g., Neon, Supabase, RDS).

## Project Structure Highlights

```
src/
 +- app/
 ¦   +- api/        # Next.js route handlers (auth, fun fact, TMDB search, favorite movie)
 ¦   +- favorite-movie/  # Movie picker flow with TMDB suggestions
 ¦   +- login/      
 ¦   +- page.tsx    # Authenticated dashboard
 +- components/     # Reusable UI (Navbar, MovieGrid, FunFact, providers)
 +- lib/            # Prisma client, TMDB helpers, movie seed data
prisma/
 +- schema.prisma   # Database schema
 +- migrations/     # Generated migration files
```

## Troubleshooting

- **Missing TMDB key**: The favourite movie page will show `TMDB_API_KEY is not configured.` Ensure `.env` is set and the server restarted.
- **OpenAI 429 errors**: Indicates quota exhaustion. Add credit or lower calls.
- **Prisma errors about missing columns**: Run the latest migration and regenerate the client (`npx prisma migrate deploy`, `npx prisma generate`).
- **VS Code shows stale type errors**: Restart the TypeScript server (`Ctrl+Shift+P ? TypeScript: Restart TS Server`).

## License

This project is provided as-is for educational purposes. Adapt and redistribute per your organisation’s requirements.
