# Project Summary — MCBP Website

## What It Is
A **React 19 Single Page Application (SPA)** for the **Metro Cebu Businessmen and Professionals – Ecozones Eagles Club**, combining a public-facing marketing site with a private admin CMS for managing blog posts.

**Live URL:** https://www.mcbp-org.com
**Repository:** GitHub (public), deployed via GitHub Pages + Porkbun DNS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7 |
| UI | Bootstrap 5, React-Bootstrap |
| Database + Auth | Supabase (PostgreSQL + email/password auth) |
| Image Hosting | Cloudinary |
| Contact Form | EmailJS (no backend needed) |
| Deployment | GitHub Pages (`gh-pages` branch) |
| Domain/DNS | Porkbun → GitHub Pages via CNAME |
| Fonts | Google Fonts (Raleway) |

---

## Architecture Decisions

**No custom backend server** — all services are third-party:
- Supabase handles DB queries and auth directly from the browser
- Cloudinary handles image uploads client-side
- EmailJS sends emails without a server

**No global state management** — component-level `useState`/`useEffect` only. No Redux or Context API.

**Role-based access:**
- `admin` — can create, edit, archive posts
- `super_admin` — can additionally permanently delete posts
- Enforced via Supabase `profiles` table `role` field

---

## Key Features

### Public Site
- **Navbar** — fixed-top, responsive; two-line brand on mobile, full brand on desktop using Raleway font; Bootstrap hamburger collapse
- **Carousel** — hero image slider
- **About Us, Join Us, Contact Us** — marketing sections
- **Blog** — public post listing with thumbnails + individual blog detail pages (`/blog/:slug`)
- **Privacy Policy** page

### Admin CMS (`/admin/*`)
- **Login page** (`/admin`) — Supabase email/password auth
- **Dashboard** (`/admin/dashboard`) — tabbed view of active and archived posts
- **New/Edit Post** (`/admin/new-post`, `/admin/edit-post/:id`) — rich post form with image upload; featured image picker with scrollable preview grid
- **Image Cleaner** (`/admin/image-cleaner`) — super_admin only; manages orphaned Cloudinary images via a grace-period queue (see below)
- **Protected routes** — `ProtectedRoute.jsx` checks `supabase.auth.getUser()` on every protected page; redirects unauthenticated users to `/admin`

### Image Upload Pipeline
1. Browser-side compression (target 450KB, max 1600px, WebP, quality 78%)
2. Upload to Cloudinary (`doeovg6x9` cloud, `mcbp_unsigned` preset, `mcbp/blog` folder)
3. Store returned `public_id` in Supabase `posts.images` array
4. URL reconstruction via `src/lib/cloudinary.js`

### Image Cleaner (Orphan Management)
Cloudinary images can become orphaned when:
- A super_admin permanently deletes a post
- An admin removes an image while editing a post

Instead of deleting immediately, a **grace-period queue** is used:
1. Orphaned `public_id`s are inserted into `pending_image_deletions` with a `scheduled_delete_at` timestamp (default: **14 days**)
2. Super_admin reviews the queue in the Image Cleaner page — thumbnails, source, and due dates are shown
3. "Run Cleanup" deletes only past-due images; "Delete All Now" overrides the grace period
4. Actual deletion is done by a **Supabase Edge Function** (`delete-cloudinary-images`) so the Cloudinary API secret never touches the browser
5. Grace period is configurable per-device via `localStorage` key `mcbp_image_cleaner_grace_days`

**Edge Function:** `supabase/functions/delete-cloudinary-images/index.ts`
- Verifies caller is `super_admin` via Supabase service-role client
- Signs each Cloudinary destroy request with SHA-1 (`public_id={id}&timestamp={ts}{api_secret}`)
- Deployed in Supabase Dashboard with **JWT verification disabled** (auth is done manually inside the function)
- Required Supabase secrets: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Database Schema (Supabase)

**`posts`** — `id`, `title`, `slug`, `description`, `story`, `location`, `activity_start_date`, `activity_end_date`, `author_name`, `images[]`, `featured_image`, `videos[]`, `created_by`, `created_at`, `updated_at`, `is_archived`

**`profiles`** — `id` (matches Supabase auth UUID), `full_name`, `role`

**`pending_image_deletions`** — `id`, `public_id`, `queued_at`, `scheduled_delete_at`, `source` (`post_deleted` | `image_removed`), `post_id` (FK → posts, ON DELETE SET NULL), `post_title`
- RLS: super_admin has full access; admin can insert only

---

## Deployment Flow

```
npm run deploy
  → npm run build   (Webpack bakes .env vars into JS bundle locally)
  → gh-pages push   (compiled static files → gh-pages branch)
  → GitHub Pages serves gh-pages branch
  → Porkbun DNS points mcbp-org.com → GitHub Pages
```

`.env` is **never pushed** — credentials get baked into the build at compile time on the developer's machine.

---

## Reusable Patterns for Future Projects

### 1. Supabase as a Full Backend Replacement
- Auth, database, row-level security — no Express/Node needed
- Pattern: `supabase.auth.getUser()` for auth checks, `supabase.from('table').select()` for queries

### 2. Protected Route Pattern
```jsx
// Check session → redirect if unauthenticated
const { data: { user } } = await supabase.auth.getUser();
if (!user) navigate('/login');
```

### 3. Client-Side Image Compression Before Upload
- Use `browser-image-compression` or canvas API to compress before hitting Cloudinary
- Saves storage costs and speeds up uploads

### 4. Cloudinary Unsigned Upload (No Backend)
- Upload directly from the browser using an unsigned preset
- Store only the `public_id`, reconstruct URLs on the fly — never store full URLs

### 5. EmailJS for Contact Forms
- Zero backend, free tier handles low-volume contact forms
- Template-based, connects to Gmail/Outlook

### 6. GitHub Pages + Custom Domain
- `CNAME` file in `public/` with your domain
- Porkbun (or any registrar): add `A` records pointing to GitHub's IPs + `CNAME` for `www`

### 7. Role-Based Access via a Profiles Table
- Mirror Supabase auth UUID in a separate `profiles` table
- Add a `role` column — check it on protected actions

### 8. .env Security with CRA
- Only `REACT_APP_*` vars get embedded in the bundle
- Safe to use Supabase `anon` key client-side — protect data with RLS, never expose the `service_role` key

### 9. Grace-Period Queue for Orphaned Cloud Assets
- Never delete cloud-hosted assets immediately — insert into a queue table with a `scheduled_delete_at`
- Review before deletion; allow grace period override for urgent cases
- Keep secrets server-side via a Supabase Edge Function (Deno); the browser only sends `public_id`s and a bearer token

### 10. Supabase Edge Functions for Sensitive Operations
- Use Deno-based Edge Functions when an operation needs a secret key (e.g., Cloudinary API secret)
- Deploy via Supabase Dashboard; disable JWT verification only when you handle auth manually inside the function
- Set secrets in Supabase Dashboard → Project Settings → Edge Functions (not in `.env`)

---

## Key Files Reference

```
src/
├── App.js                        # All route definitions
├── lib/
│   ├── supabase.js               # Supabase client init
│   ├── cloudinary.js             # URL builder
│   └── cloudinaryUpload.js       # Compress + upload logic
├── components/
│   ├── NavBar.jsx                # Site navigation
│   └── ProtectedRoute.jsx        # Auth guard
├── pages/
│   ├── AdminDashboard.jsx        # Post management (queues orphaned images on delete)
│   ├── NewPost.jsx               # Create/edit posts (queues removed images)
│   ├── ImageCleaner.jsx          # Orphaned image queue manager (super_admin only)
│   ├── BlogDetail.jsx            # Public blog post view
│   └── Dashboard.jsx             # Admin landing
public/
├── index.html                    # Meta tags, fonts, favicon
├── mcbp-favicon.png              # Site icon (also used for OG/Twitter)
└── CNAME                         # Custom domain for GitHub Pages
supabase/
└── functions/
    └── delete-cloudinary-images/
        └── index.ts              # Edge Function: signs + fires Cloudinary destroy API
```
