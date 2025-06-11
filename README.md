# Plantropy

AI-powered social coordination app.

## Mission

Create foundational architecture for an AI-powered social coordination app that starts with local date/hangout planning and scales to complex group travel coordination.

## Tech Stack

- Monorepo (PNPM Workspaces + Turborepo)
- Next.js 14 with App Router (Web)
- Supabase (Backend: Auth, Database, Real-time, Storage)
- TypeScript (Strict)
- CSS-in-JS (Styled Components or Emotion)
- Zustand (State Management)

## Folder Structure

- `apps/`: Contains platform-specific applications (e.g., `web`, `mobile`).
- `packages/`: Contains shared code (e.g., `ui`, `core-logic`, `services`, `store`, `types`, `utils`).
- `supabase/`: Contains Supabase local development setup (migrations, functions).

## Getting Started

1. Install PNPM: `npm install -g pnpm`
2. Install dependencies: `pnpm install`
3. Set up Supabase local development: `pnpm supabase start` (requires Supabase CLI)
4. Run the web app: `pnpm dev`

