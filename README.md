# S.O.T.D. — Scent of the Day
### Agentic Fragrance Recommendation Platform

## Project Overview

S.O.T.D. (Scent of the Day) is a full-stack fragrance recommendation app that helps users decide **what to wear next from what they already own**.

Users build a personal collection of fragrances, then get context-aware recommendations based on season, occasion, time of day, weather, and location. The app offers two recommendation modes: a guided step-by-step selector and a natural language AI agent that interprets free-form queries like *"something for a rainy evening date"* and autonomously picks the right scent.

---

## Core Features

- User registration and JWT-based authentication
- Personal fragrance collection management (CRUD)
- Context-aware recommendation engine with weighted scoring:
  - context matching (season, occasion, weather, time of day, location type)
  - personal rating bonus (scaled 0–6 across the 1–10 range)
  - recency decay penalty based on `last_worn_at`
- Top 3 recommendations per request with human-readable explanations
- **Natural language AI agent** — interprets free-form queries, calls the scoring engine as a tool, and returns a conversational recommendation
- **Agent session logging** — every agent run is stored in the database with full tool call history for observability
- Filtering and pagination for collection and catalog endpoints
- Consistent API response structure using data envelopes
- Standardized error handling and application logging
- React frontend with dark theme, step-by-step dashboard, and Ask tab

---

## Architecture Overview

### Backend

The backend follows a strict layered architecture:

- **Routes (`api/routes`)**
  - Handle HTTP requests and responses
  - Perform dependency injection and route-level orchestration

- **Schemas (`schemas`)**
  - Define request and response contracts using Pydantic
  - Enforce validation and response consistency

- **Models (`models`)**
  - Represent database tables using SQLAlchemy
  - Define relationships and constraints

- **Services (`services`)**
  - `recommendation.py` — weighted scoring engine
  - `agent.py` — PydanticAI agent with two tools: `get_collection_context` and `score_fragrances`

- **Core (`core`)**
  - Configuration, security, logging, and global error handling

- **Database (`db`)**
  - Session management and base model setup

### Frontend

Pure SPA built with React 18 + TypeScript + Vite + Tailwind CSS. Key pages:

- **Landing** — hero with tabbed sign-in / register
- **Dashboard** — two tabs: step-by-step context wizard and AI Ask tab
- **Collection** — grid view with filters and stats
- **Add Fragrance** — catalog browser with search and modal

---

## Tech Stack

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.11
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Authentication:** JWT (OAuth2 password flow)
- **Testing:** Pytest + FastAPI TestClient
- **Validation:** Pydantic

### AI / Agent
- **Agent framework:** PydanticAI
- **LLM:** Anthropic Claude (`claude-haiku-4-5-20251001`)

### Frontend
- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS v3

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/JPEA97/fragrance-collection-api.git
cd fragrance-collection-api
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fragrance_db
SECRET_KEY=change_me_in_real_projects
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=Fragrance Collection API
APP_VERSION=0.1.0
ANTHROPIC_API_KEY=sk-ant-...your key here...
```

### Variable Reference

- `DATABASE_URL` — PostgreSQL connection string used by SQLAlchemy and Alembic
- `SECRET_KEY` — Secret used to sign JWT access tokens
- `ALGORITHM` — JWT signing algorithm (`HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES` — Token expiration time in minutes
- `APP_NAME` — Application name exposed in API metadata
- `APP_VERSION` — Application version exposed in API metadata
- `ANTHROPIC_API_KEY` — API key for Anthropic Claude, used by the AI agent. Get yours at [console.anthropic.com](https://console.anthropic.com)

### Notes

- `SECRET_KEY` should be replaced with a secure random value in real environments
- `.env` should **never** be committed
- The Anthropic API key requires active API credits (separate from Claude subscriptions)

---

## Database & Migrations

### 1. Create the PostgreSQL database

```text
fragrance_db
```

### 2. Apply migrations

From the `backend/` folder:

```bash
alembic upgrade head
```

This will create all required tables including `agent_sessions` for AI agent logging.

---

## Seed Data

From the `backend/` folder:

```bash
python -m scripts.seed_catalog
```

This populates brands, fragrances, tags, and fragrance-tag relationships. Re-run any time to apply catalog updates — the script is idempotent.

---

## Running the Project

Two servers must run simultaneously:

```bash
# Terminal 1 — backend (from backend/)
source .venv/Scripts/activate
uvicorn app.main:app --reload

# Terminal 2 — frontend (from frontend/)
npm run dev
```

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`
- Swagger Docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

---

## Authentication Flow

1. Register via `POST /users/`
2. Log in via `POST /auth/login`
3. Include the returned JWT in protected requests:

```http
Authorization: Bearer <access_token>
```

The login endpoint uses the OAuth2 `username` field to receive the user's **email**. All protected endpoints resolve the authenticated user from the token. Collection items are always scoped to the authenticated user.

---

## API Endpoints Overview

### Auth

- `POST /users/` — Register a new user
- `POST /auth/login` — Authenticate and return access token
- `GET /users/me` — Get current authenticated user

### Fragrances

- `GET /fragrances/` — Browse catalog (search, brand filter, pagination)
- `GET /fragrances/{id}` — Get fragrance detail

### Collection

- `POST /collection/` — Add a fragrance to the user's collection
- `GET /collection/` — List collection (filters, pagination)
- `GET /collection/{id}` — Get a single collection item
- `PATCH /collection/{id}` — Update ownership type, rating, ml, wear count
- `DELETE /collection/{id}` — Remove from collection

### Recommendation

- `POST /recommendation/` — Get top 3 scored recommendations for a given context

### Agent

- `POST /agent/recommend` — Natural language recommendation. Send a free-form query, get a conversational response. Every run is logged to `agent_sessions`.

---

## Recommendation Logic

### Scoring Model

Each fragrance in the user's collection is scored against the provided context:

- **Context matches**
  - Occasion → +5
  - Weather → +5
  - Season → +3
  - Time of day → +3
  - Location type → +3

- **Personal rating bonus** (0–6)
  - Rating 1–4 → +0
  - Rating 5–6 → +2
  - Rating 7–8 → +4
  - Rating 9–10 → +6

- **Recency decay penalty** (based on `last_worn_at`)
  - Worn today → -5
  - 2–3 days ago → -3
  - 4–7 days ago → -1
  - Older or never worn → 0

### Selection Rules

- Only fragrances with tag mappings are considered (untagged fragrances are excluded)
- Top 3 results are returned, sorted by score descending
- Tie-break: lower `times_worn` wins

---

## AI Agent

The `POST /agent/recommend` endpoint exposes a PydanticAI agent backed by Claude (`claude-haiku-4-5-20251001`).

### How it works

1. The user submits a natural language query (e.g. *"something fresh for a beach day"*)
2. The agent calls `get_collection_context` to understand what the user owns
3. The agent maps the query to structured context parameters and calls `score_fragrances`, which runs the existing scoring engine
4. The agent returns a conversational response explaining its top pick
5. The full tool call history and final response are saved to `agent_sessions`

### Tools

| Tool | Purpose |
|---|---|
| `get_collection_context` | Returns the user's collection with names, brands, ratings, and tags |
| `score_fragrances` | Runs the scoring engine for a given context, returns top 3 |

### Session logging

Every agent run creates a row in `agent_sessions` with:
- `query` — the original natural language input
- `steps` — full JSON message history (tool calls + results)
- `final_response` — the agent's conversational reply
- `model_used` — the model identifier
- `created_at` — timestamp

---

## Testing

### Running Tests

From the `backend/` folder:

```bash
pytest
```

### Coverage

**Integration tests** validate end-to-end API behavior:
- Authentication and unauthorized access
- Collection ownership enforcement
- Collection CRUD lifecycle
- Filtering and pagination
- Recommendation endpoint ranking

**Unit tests** validate the recommendation scoring engine in isolation:
- Context match scoring
- Rating bonus and recency penalty
- Tie-breaking logic
- Reason generation
- Empty input behavior

### Notes

- Integration tests use a separate SQLite test database
- Each test runs with a clean schema for isolation
- A custom `unaccent()` SQLite shim mimics the PostgreSQL text search behavior

---

## Operational Notes

- Global exception handlers return standardized error envelopes
- Application logging covers startup, auth events, collection mutations, recommendation generation, and agent runs
- Health check endpoint at `/health`
