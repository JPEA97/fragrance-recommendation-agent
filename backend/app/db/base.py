from sqlalchemy.orm import DeclarativeBase


# This is the modern SQLAlchemy 2.x style.
# Base becomes the parent class that all our models will inherit from.
class Base(DeclarativeBase):
    pass
