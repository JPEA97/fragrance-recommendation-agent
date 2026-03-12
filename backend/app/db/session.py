# This file creates the SQLAlchemy engine, which is the object that knows how to connect to PostgreSQL,
# and SessionLocal, which is the factory we will use later to open database sessions per request.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
