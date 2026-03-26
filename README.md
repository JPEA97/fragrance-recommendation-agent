# Fragrance Collection API

## Project Overview

Fragrance Collection API is a backend system designed to recommend fragrances from a user’s personal collection based on contextual inputs such as season, occasion, time of day, weather, and location type.

Instead of recommending arbitrary products, the system focuses on helping users decide **what to wear next from what they already own**. The recommendation engine evaluates each fragrance in the user’s collection using a weighted scoring system that considers contextual matches, personal rating, and usage frequency.

The API is designed around a structured backend architecture with authentication, relational data modeling, service-layer recommendation logic, and tested endpoint behavior.

---

## Core Features

- User authentication with JWT-based login
- Personal fragrance collection management (CRUD)
- Context-aware recommendation engine
- Weighted scoring system with:
  - context matching (season, occasion, weather, time of day, location type)
  - personal rating influence
  - usage penalty (`times_worn`)
- Top 3 recommendations per request
- Human-readable explanation for each recommendation
- Filtering and pagination for collection endpoints
- Consistent API response structure using data envelopes
- Standardized API error handling
- Basic application logging and health check endpoint
- Test coverage including:
  - integration tests
  - unit tests

---

## Architecture Overview

The backend follows a layered architecture to separate concerns and keep the codebase maintainable as complexity grows.

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
  - Contain business logic (e.g. recommendation scoring)
  - Keep route handlers thin and focused

- **Core (`core`)**
  - Configuration, security, logging, and global error handling

- **Database (`db`)**
  - Session management and base model setup

This separation ensures that business logic, data access, and API concerns remain decoupled and easier to maintain over time.

---

## Tech Stack

- **Backend Framework:** FastAPI
- **Language:** Python 3.11
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Authentication:** JWT (OAuth2 password flow)
- **Testing:** Pytest + FastAPI TestClient
- **Validation:** Pydantic

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/JPEA97/fragrance-collection-api.git
cd fragrance-collection-api/backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/Scripts/activate
```

> On Windows Git Bash, the above activation path should work.  
> On PowerShell, use:
>
> `.venv\Scripts\Activate.ps1`

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file inside the `backend/` folder.

You can use the included `.env.example` file as a template:

```bash
cp .env.example .env
```

> On Windows PowerShell, you can copy it with:
>
> ```powershell
> Copy-Item .env.example .env
> ```

Then update the values as needed.

Example:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fragrance_db
SECRET_KEY=change_me_in_real_projects
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=Fragrance Collection API
APP_VERSION=0.1.0
```

### Variable Reference

- `DATABASE_URL`
  - PostgreSQL connection string used by SQLAlchemy and Alembic

- `SECRET_KEY`
  - Secret used to sign JWT access tokens

- `ALGORITHM`
  - JWT signing algorithm (currently `HS256`)

- `ACCESS_TOKEN_EXPIRE_MINUTES`
  - Token expiration time in minutes

- `APP_NAME`
  - Application name exposed in API metadata

- `APP_VERSION`
  - Application version exposed in API metadata

### Notes

- `DATABASE_URL` should point to your local PostgreSQL database
- `SECRET_KEY` should be replaced with a secure random value in real environments
- `.env` should **never** be committed
- `.env.example` should be committed as the configuration template

---

## Database & Migrations

This project uses **Alembic** to manage database schema changes.

### 1. Create the PostgreSQL database

Create a database called:

```text
fragrance_db
```

### 2. Apply migrations

From the `backend/` folder, run:

```bash
alembic upgrade head
```

This will create all required tables in the database.

---

## Seed Data

The project includes a seed script to populate a minimal fragrance catalog for development and testing.

This script inserts:

- brands
- fragrances
- tags
- fragrance-tag relationships

From the `backend/` folder, run:

```bash
python -m scripts.seed_catalog
```

After seeding, you will have enough catalog data to:

- add fragrances to a user collection
- test recommendation flows
- validate filters and endpoints

---

## Running the API

From the `backend/` folder, start the app with:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- App: `http://127.0.0.1:8000`
- Health: `http://127.0.0.1:8000/health`
- Swagger Docs: `http://127.0.0.1:8000/docs`

---

## Authentication Flow

The API uses JWT-based authentication with the OAuth2 password flow.

### Flow Overview

1. A user registers via `POST /users/`
2. The user logs in via `POST /auth/login`
3. The API returns a JWT access token
4. The token must be included in protected requests:

```http
Authorization: Bearer <access_token>
```

### Notes

- The login endpoint uses the OAuth2 `username` field to receive the user's **email**
- All protected endpoints resolve the authenticated user from the token
- User ownership is enforced at the query level (e.g. collection items belong only to the authenticated user)

---

## API Endpoints Overview

### Auth

- `POST /users/`  
  Create a new user

- `POST /auth/login`  
  Authenticate user and return access token

- `GET /users/me`  
  Retrieve current authenticated user

---

### Collection

- `POST /collection/`  
  Add a fragrance to the user’s collection

- `GET /collection/`  
  Retrieve collection (supports filtering and pagination)

- `GET /collection/{id}`  
  Retrieve a specific collection item

- `PATCH /collection/{id}`  
  Update collection item fields

- `DELETE /collection/{id}`  
  Remove item from collection

---

### Recommendation

- `POST /recommendation/`  
  Return top 3 fragrance recommendations based on context input

---

## Recommendation Logic

The recommendation engine evaluates each fragrance in the user’s collection using a weighted scoring system.

### Scoring Model

Each fragrance receives a score based on:

- **Context matches**
  - Occasion → +5
  - Weather → +5
  - Season → +3
  - Time of day → +3
  - Location type → +3

- **Personal rating**
  - Added as a bonus (capped)

- **Usage penalty**
  - Based on `times_worn`
  - Prevents frequently used fragrances from dominating recommendations

### Selection Rules

- Only fragrances in the user’s collection are considered
- Results are sorted by score (descending)
- Top 3 results are returned
- In case of a tie:
  - Lower `times_worn` is preferred
  - If still tied, selection is randomized

### Output

Each recommendation includes:

- fragrance name
- brand
- computed relevance
- human-readable explanation ("reason")

---

## Testing

The project includes both **integration tests** and **unit tests**.

### Integration Test Coverage

Integration tests validate the behavior of the API end-to-end using `pytest` and FastAPI’s `TestClient`.

Covered flows include:

- Authentication flow
- Unauthorized access handling
- Collection ownership enforcement
- Collection CRUD lifecycle
- Filtering and pagination
- Recommendation endpoint behavior and ranking

### Unit Test Coverage

Unit tests validate the recommendation scoring engine in isolation.

Covered logic includes:

- Top 3 result slicing
- Stronger context matches ranking higher
- Tie-breaking using lower `times_worn`
- Reason generation
- Empty input behavior

### Running Tests

From the `backend/` folder:

```bash
pytest
```

### Notes

- Integration tests use a separate SQLite test database
- The application’s database dependency is overridden during tests
- Each test runs with a clean schema to ensure isolation
- Recommendation service unit tests run without database or API setup

## Operational Notes

The API includes a lightweight operational layer to improve reliability and inspectability:

- Global exception handlers for standardized error responses
- Basic application logging for startup, auth events, collection mutations, and recommendation generation
- Health check endpoint at `/health`

This keeps failure behavior more predictable and makes the backend easier to debug during development and testing.
