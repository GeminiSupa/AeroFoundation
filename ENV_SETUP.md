# Supabase env setup

The app reads Supabase config from **`.env.local`** in this folder (project root).

## 1. Create `.env.local`

Copy from the example:

```bash
cp .env.example .env.local
```

## 2. Use the exact variable names (required by Vite)

Names **must** start with `VITE_` or the app will not see them (and you get "invalid api key"):

```
VITE_SUPABASE_URL=https://ilmdsuplyjwfbgnhcejh.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get the values from **Supabase Dashboard → your project → Settings → API**:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** → `VITE_SUPABASE_ANON_KEY`
- **service_role** → `VITE_SUPABASE_SERVICE_ROLE_KEY`

Paste the keys with **no quotes** and **no extra spaces**. One value per line.

## 3. Restart the dev server

After saving `.env.local`:

1. Stop the server (Ctrl+C in the terminal).
2. Start it again: `npm run dev`.

Vite only reads env when it starts, so a restart is required after any change.
