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
- Integration test coverage for:
  - authentication
  - collection ownership
  - collection lifecycle
  - recommendation logic

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
  - Configuration and security (JWT, hashing, settings)

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
- Swagger Docs: `http://127.0.0.1:8000/docs`
