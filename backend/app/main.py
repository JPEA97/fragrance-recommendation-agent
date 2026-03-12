# Entry point of the API. It creates the FastAPI application object and defines the first route so the server can run

from fastapi import FastAPI
from app.core.config import settings


# Creating application object
app = FastAPI(
    title=settings.app_name,
    description="Backend service for managing fragrance collections and giving contextual recommendations",
    version=settings.app_version,
    debug=settings.debug,
)


# Basic route so we can confirm the server is working
@app.get("/")
def health_check():
    return {"status": "API running"}
