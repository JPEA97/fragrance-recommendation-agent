# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**S.O.T.D. (Scent of the Day)** — a personal fragrance recommendation tool. The core workflow: users build a personal collection of fragrances they own, then receive context-aware recommendations for what to wear from that collection based on season, occasion, time of day, weather, and location.

Both the backend and frontend are fully implemented and working on `main`.

---

## Current state (as of 2026-04-01)

- Backend: complete, all endpoints working, full integration + unit test coverage. No changes this session.
- Frontend: complete. Significant UI overhaul this session — see changelog below.
- Both `main` and `frontend-foundation` are in sync and pushed to origin.
- Last commit: `feat: add About page accessible from landing and app navbar` (`063c23b`)

### Frontend changelog (2026-04-01)

- **Landing page** (`/`) — radial indigo glow hero with large typography + tabbed sign in / register section on scroll. "About" link top-right.
- **Dashboard** — redesigned as a step-by-step context selector. One big question per screen, auto-advances on selection, breadcrumb trail, fade transitions between phases (steps → loading → results).
- **Dashboard route** moved from `/` to `/dashboard`. Unauthenticated users redirect to `/` (not `/login`). Logout goes to `/`.
- **About page** (`/about`) — public route, no login required. Accessible from landing page and navbar. Same visual style as landing page.
- **Fragrance images** — static local files in `frontend/public/images/`. Mapped via `frontend/src/lib/fragranceImages.ts` using `"Brand::Name"` keys. 45+ images added. Images show in catalog tiles, collection cards, item detail, and recommendation results.
- **Collection page** — 2-column grid, always-visible filters (no accordion), sticky header with stats bar.
- **Catalog page** — product tile cards (image area at top, letter placeholder for missing images), sticky search bar, 3–4 column grid.
- **Layout** — subtle ambient indigo glow on all inner pages, navbar has `backdrop-blur`.
- **SVG favicon** — indigo perfume bottle at `frontend/public/favicon.svg`.

---

## Running the project

Two servers must run simultaneously:

```bash
# Terminal 1 — backend (from backend/)
source .venv/Scripts/activate   # Windows Git Bash
uvicorn app.main:app --reload

# Terminal 2 — frontend (from frontend/)
npm run dev
```

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`

CORS is configured on the backend to allow `http://localhost:5173`. If the frontend dev port changes, update `allow_origins` in `app/main.py`.

---

## Backend

All backend commands run from the `backend/` directory with the virtual environment activated.

```bash
source .venv/Scripts/activate   # Windows Git Bash
.venv\Scripts\Activate.ps1      # Windows PowerShell
```

### Common commands

```bash
# Run the dev server
uvicorn app.main:app --reload

# Run all tests
pytest

# Run a single test file
pytest tests/test_auth.py

# Run a single test by name
pytest tests/test_auth.py::test_auth_flow

# Apply migrations
alembic upgrade head

# Seed the fragrance catalog
python -m scripts.seed_catalog
```

### Architecture

The backend follows a strict layered pattern. Requests flow through:

**Routes → Schemas → Models / Services → DB**

- `app/api/routes/` — HTTP handlers. Thin. Do dependency injection and call services or query the DB directly for simple cases.
- `app/schemas/` — Pydantic request/response contracts. All API input validation lives here.
- `app/models/` — SQLAlchemy ORM models. One file per table.
- `app/services/recommendation.py` — The only service layer. Contains the recommendation scoring engine (context matching, rating bonus, times_worn penalty, top-3 selection).
- `app/core/` — Config (pydantic-settings from `.env`), JWT security, logging setup, global error handlers.
- `app/db/` — Engine and `SessionLocal` factory in `session.py`, `get_db` generator dep in `deps.py`, `Base` declarative class in `base.py`.

### Models and DB schema

| Model | Table | Key fields |
|---|---|---|
| User | users | id, email, username, hashed_password, is_active |
| Brand | brands | id, name, name_normalized |
| Fragrance | fragrances | id, brand_id, name, name_normalized, release_year, gender_category, description |
| Tag | tags | id, name, category (season/occasion/time_of_day/weather/location_type) |
| FragranceTag | fragrance_tags | fragrance_id, tag_id |
| CollectionItem | collection_items | id, user_id, fragrance_id, ownership_type, ml_remaining, personal_rating, times_worn |

`ownership_type` enum: `full_bottle`, `decant`, `sample`.

### Response conventions

All successful responses use data envelopes — never raw objects or arrays:

```json
{ "data": { ... } }                           // single resource
{ "data": [ ... ], "meta": { "count": 3 } }   // list
```

All errors follow:

```json
{ "error": { "type": "...", "message": "...", "details": null } }
```

**Exception:** `POST /auth/login` returns `{ access_token, token_type }` directly (OAuth2 standard, no envelope).

### Auth

- OAuth2 password flow. Login endpoint at `POST /auth/login` expects `application/x-www-form-urlencoded`.
- The `username` field in the OAuth form receives the user's **email** — this is by design.
- JWT tokens encode `user_id` as the `sub` claim.
- Token ownership is resolved in `app/api/deps/current_user.py` and injected as a dependency into protected routes.
- The client never sends `user_id` explicitly — it is always inferred from the token.

### API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users/` | No | Register new user |
| GET | `/users/me` | Yes | Get current user |
| POST | `/auth/login` | No | Login (form-encoded), returns token |
| GET | `/fragrances/` | Yes | Browse catalog (search, brand filter, pagination) |
| GET | `/fragrances/{id}` | Yes | Get fragrance detail |
| GET | `/collection/` | Yes | List user's collection (brand, type, min_rating filters, pagination) |
| POST | `/collection/` | Yes | Add fragrance to collection |
| GET | `/collection/{id}` | Yes | Get collection item detail (includes fragrance info) |
| PATCH | `/collection/{id}` | Yes | Update ownership_type, ml_remaining, personal_rating, times_worn |
| DELETE | `/collection/{id}` | Yes | Remove from collection (204) |
| POST | `/recommendation/` | Yes | Get top-3 recommendations for a context |

### Recommendation engine

`app/services/recommendation.py::build_recommendations` receives raw DB rows `(CollectionItem, Fragrance, Brand, Tag)`, groups by collection item, scores each, and returns the top 3.

Scoring weights: occasion +5, weather +5, season +3, time_of_day +3, location_type +3, personal_rating bonus (capped at 3), times_worn penalty (capped at 5). Tie-break: lower `times_worn` wins.

**Important**: fragrances with no tags are silently excluded because the query joins on `fragrance_tags`. This is intentional behavior.

### Migrations

Migration files are in `alembic/versions/`. The `alembic/env.py` reads `DATABASE_URL` from settings and imports all models to ensure autogenerate detects the full schema. When adding a new model, import it in `alembic/env.py`.

### Tests

- Integration tests use SQLite (`test.db`) via a `get_db` override in `conftest.py`.
- Each test function gets a fresh schema (drop/create in `setup_database` fixture).
- `conftest.py` provides: `client`, `db_session`, `create_user`, `login_user`, `auth_headers`, `seeded_catalog` fixtures.
- Unit tests for the recommendation service (`test_recommendation_service.py`) use `SimpleNamespace` objects — no DB or HTTP setup needed.

---

## Frontend

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS v3. Pure SPA — no SSR, no Next.js.

**Design:** Dark theme. Base background `zinc-950`, cards `zinc-900`, borders `zinc-800/700`, primary text `white`, secondary text `zinc-400`. Accent color indigo. Do not revert to light colors without being asked.

**Brand name:** "S.O.T.D." — displayed in the navbar and on the login/register pages. Do not change back to "Fragrance".

### Common commands

```bash
# From frontend/
npm run dev      # start dev server on localhost:5173
npm run build    # production build
npm run preview  # preview production build
```

### Folder structure

```
frontend/
├── public/
│   ├── favicon.svg            # indigo perfume bottle SVG
│   └── images/                # static fragrance bottle images (45+)
└── src/
    ├── api/
    │   ├── client.ts          # base fetch wrapper — auth injection, envelope unwrapping, error normalization, 401 redirect
    │   ├── auth.ts            # register, login, getMe
    │   ├── collection.ts      # list, get, create, patch, delete collection items
    │   ├── fragrances.ts      # getFragrances (list), getFragrance (detail)
    │   └── recommendation.ts  # POST /recommendation/
    ├── contexts/
    │   └── AuthContext.tsx    # token, current user, login(), logout() — reads sessionStorage on load
    ├── hooks/
    │   ├── useCollection.ts   # fetch collection list with filter params
    │   └── useRecommendation.ts  # calls POST /recommendation/, handles 404 as empty-collection
    ├── lib/
    │   └── fragranceImages.ts # maps "Brand::Name" → /images/filename.png
    ├── pages/
    │   ├── LandingPage.tsx         # public hero + tabbed auth on scroll
    │   ├── AboutPage.tsx           # public about page, same visual style as landing
    │   ├── LoginPage.tsx           # standalone email + password form
    │   ├── RegisterPage.tsx        # standalone register form, auto-logs in after register
    │   ├── DashboardPage.tsx       # step-by-step context selector → recommendation results
    │   ├── CollectionPage.tsx      # 2-col grid, sticky header, always-visible filters, stats bar
    │   ├── CollectionItemPage.tsx  # detail view with inline edit, image header, delete-with-confirm
    │   └── AddFragrancePage.tsx    # product tile catalog, sticky search, modal → add to collection
    ├── components/
    │   ├── Layout.tsx              # navbar + ambient glow wrapper for all authenticated pages
    │   ├── ProtectedRoute.tsx      # auth guard with loading spinner, wraps Layout
    │   ├── ContextForm.tsx         # 5-field toggle-button context selector (unused by dashboard, kept for reference)
    │   ├── RecommendationResult.tsx  # top pick card + 2 alternatives, shows fragrance images
    │   └── CollectionCard.tsx      # clickable grid card with image thumbnail, ownership badge, stats
    ├── types/
    │   └── api.ts             # all TS types matching backend contracts
    ├── router.tsx             # BrowserRouter + AuthProvider + route tree
    └── main.tsx
```

### Pages and routes

| Page | Route | Auth required |
|---|---|---|
| Landing | `/` | No |
| About | `/about` | No |
| Login | `/login` | No |
| Register | `/register` | No |
| Dashboard | `/dashboard` | Yes |
| My Collection | `/collection` | Yes |
| Collection Item | `/collection/:id` | Yes |
| Add Fragrance | `/collection/add` | Yes |

Unauthenticated users hitting protected routes redirect to `/` (landing). Authenticated users visiting `/` redirect to `/dashboard`. Logout navigates to `/`. Protected routes are wrapped in `Layout` which renders the top navbar.

### Design token reference

When writing new UI, follow these conventions to stay consistent with the dark theme:

| Purpose | Class |
|---|---|
| Page background | `bg-zinc-950` |
| Card / panel | `bg-zinc-900 border border-zinc-800` |
| Elevated / hover target | `bg-zinc-800`, `hover:bg-zinc-800` |
| Border default | `border-zinc-800` |
| Border input | `border-zinc-700` |
| Input field | `bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500` |
| Primary text | `text-white` |
| Secondary text | `text-zinc-400` |
| Label / muted text | `text-zinc-300` / `text-zinc-500` |
| Active nav link | `text-indigo-400` |
| Inactive nav link | `text-zinc-400 hover:text-white` |
| Primary button | `bg-indigo-600 text-white hover:bg-indigo-700` |
| Secondary button | `text-zinc-300 border border-zinc-700 hover:bg-zinc-800` |
| Toggle button (selected) | `bg-indigo-600 text-white border-indigo-600` |
| Toggle button (unselected) | `bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700` |
| Error alert | `bg-red-950/50 border border-red-800 text-red-400` |
| Warning / empty state | `bg-amber-950/50 border border-amber-800 text-amber-400` |
| Top pick card | `bg-indigo-950/50 border border-indigo-800` |
| Full bottle badge | `bg-emerald-950 text-emerald-400` |
| Decant badge | `bg-blue-950 text-blue-400` |
| Sample badge | `bg-zinc-800 text-zinc-400` |

### API client pattern

`api/client.ts` is the only place that talks to `fetch`. It handles:
- Injecting `Authorization: Bearer <token>` on every request
- Unwrapping `{ data }` envelopes for single items (`apiGet`, `apiPost`, `apiPatch`)
- Unwrapping `{ data, meta }` envelopes for lists (`apiGetList`, `apiPostList`) — returns `{ items, meta }`
- Normalizing error responses into thrown `ApiError` objects
- On any 401 (except login): clears token from sessionStorage and redirects to `/login`

`apiPostForm` is used exclusively for login. It returns the raw JSON (no unwrapping) and does **not** trigger the 401 redirect, since a failed login should stay on the login page.

### Auth token storage

Token is stored in `sessionStorage` (survives page refresh, cleared on tab close). On app load, `AuthContext` reads the token and calls `GET /users/me` to rehydrate the current user.

### State management

No external state library:

- `AuthContext` (React Context + `useState`) — global auth state, token, current user
- `useCollection` and `useRecommendation` custom hooks — local fetch state with `loading`, `error`, `data`
- Individual page mutations (add, patch, delete) call API functions directly — no shared mutation state needed

If caching or background refetch becomes painful, TanStack Query is the agreed upgrade path.

### Key backend contract notes for the frontend

- `POST /auth/login` returns `{ access_token, token_type }` directly — not wrapped. `apiPostForm` handles this.
- `POST /collection/` returns `CollectionItemResponse` (no fragrance detail). List and detail endpoints return `CollectionItemDetailResponse` with nested `fragrance: { id, name, brand }`.
- `PATCH /collection/{id}` also returns `CollectionItemResponse` (no fragrance detail). The item detail page keeps fragrance data from the initial GET in local state and merges patch results into it.
- `DELETE /collection/{id}` returns 204 No Content.
- `POST /recommendation/` returns a list envelope with `[{ id, name, brand, reason }]`. A 404 means either empty collection or no tagged candidates — both are shown as an empty-collection CTA, not an error.
- Pagination: `meta.count` is the count of items returned (not total). Use `count === limit` to determine whether a next page exists.

### Critical user flows

**New user:** Landing (`/`) → scroll to auth → Register → auto-login → `/dashboard` → empty collection CTA → Add Fragrance → collection populated → Dashboard → Get Recommendation

**Daily use:** Login → `/dashboard` → step-by-step context (season → occasion → time → weather → location, auto-advances) → loading phase → top 3 results. "Start over" resets the flow.

**Collection maintenance:** Collection list → item card → detail page → update rating / times_worn / ml → Save changes button appears when dirty → save → improved future recommendations

**Add fragrance:** Add Fragrance → sticky search / brand filter → product tile catalog → select → modal (ownership type + optional rating + optional ml) → saved → redirects to `/collection`

### Fragrance images

Images are static local files in `frontend/public/images/`. The mapping lives in `frontend/src/lib/fragranceImages.ts`:

```ts
// Maps "Brand::Fragrance Name" → "/images/filename.png"
const images: Record<string, string> = {
  'Hugo Boss::Boss Reversed': '/images/boss-reversed.png',
  // ...
}
```

**When adding new images:**
1. Drop the file in `frontend/public/images/`
2. Check the exact brand and name in `backend/scripts/data/catalog.json` (watch for accents: `Lancôme`, `Adolfo Domínguez`, `Acqua di Giò Profondo`, etc.)
3. Add one line to `fragranceImages.ts`

Images render in: catalog tiles, collection cards, collection item detail header, recommendation result cards.
