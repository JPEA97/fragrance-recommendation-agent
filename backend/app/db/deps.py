from typing import Generator

from app.db.session import SessionLocal


# SessionLocal() creates a new SQLAlchemy session
# yield db gives it to the endpoint
# when the request finishes, the finally block runs and closes the session
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
