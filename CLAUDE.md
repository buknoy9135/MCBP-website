# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build (also writes CNAME for GitHub Pages)
npm test           # Run tests with React Testing Library
npm run deploy     # Build + deploy to GitHub Pages
npm run generate-sitemap  # Generate sitemap.xml for SEO
npx prettier --write .    # Format code
```

## Architecture

This is a React 19 SPA (Create React App) for the Metro Cebu Businessmen and Professionals (MCBP) organization. It combines a public marketing site with an admin CMS for managing blog posts.

**Backend services (no custom server):**
- **Supabase** — PostgreSQL database + auth (email/password). Client initialized in `src/lib/supabase.js`.
- **Cloudinary** — Image hosting. Uploads flow through `src/lib/cloudinaryUpload.js` (client-side compression → Cloudinary). URL construction in `src/lib/cloudinary.js`.
- **EmailJS** — Contact form submissions (no backend needed).

**Routing** (`src/App.js`):
- Public: `/`, `/about`, `/blog/:slug`, `/privacy-policy`
- Auth: `/admin` (login), `/auth/callback` (OAuth handler)
- Protected (requires Supabase session): `/admin/dashboard`, `/admin/new-post`, `/admin/edit-post/:id`, `/admin/blog/:slug`

`src/components/ProtectedRoute.jsx` guards admin routes by calling `supabase.auth.getUser()` and redirecting to `/admin` if unauthenticated.

**State management:** Component-level `useState`/`useEffect` only — no Redux or Context API. Auth state is checked per-component via `supabase.auth.onAuthStateChange()`.

**Role system:** The `profiles` table has a `role` field (`"admin"` or `"super_admin"`). Super admins can permanently delete posts; regular admins can only archive.

**Image upload pipeline** (`src/lib/cloudinaryUpload.js`):
1. Browser-side compression (target 450KB, max 1600px, WebP, quality 78%)
2. Upload to Cloudinary cloud `doeovg6x9`, preset `mcbp_unsigned`, folder `mcbp/blog`
3. Store returned `public_id` in Supabase `posts.images` array

**Styling:** Bootstrap 5 + React-Bootstrap for layout/components, with per-component CSS files in `src/css/` for custom styles.

## Environment Variables

Requires a `.env` file at project root (not committed):
```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```
EmailJS and Cloudinary credentials are hardcoded in their respective lib files (cloud name, preset, EmailJS service/template IDs).

## Database Schema (Supabase)

**`posts` table:** `id`, `title`, `slug`, `description`, `story`, `location`, `activity_start_date`, `activity_end_date`, `author_name`, `images` (array of Cloudinary public IDs), `videos` (array), `created_by` (UUID), `created_at`, `updated_at`, `is_archived`

**`profiles` table:** `id` (matches auth user UUID), `full_name`, `role`

## Key Files

- `src/App.js` — Route definitions
- `src/lib/supabase.js` — Supabase client
- `src/lib/cloudinaryUpload.js` — Image compression + upload logic
- `src/lib/cloudinary.js` — Cloudinary URL builder
- `src/pages/AdminDashboard.jsx` — Post management (active/archived tabs)
- `src/pages/NewPost.jsx` — Create/edit posts with image upload
- `src/components/ProtectedRoute.jsx` — Auth guard
- `generate-sitemap.js` — SEO sitemap generation script
