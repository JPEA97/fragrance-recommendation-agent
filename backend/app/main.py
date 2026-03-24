# Entry point of the API. It creates the FastAPI application object and defines the first route so the server can run

from fastapi import FastAPI

from app.api.routes.users import router as users_router
from app.api.routes.auth import router as auth_router
from app.api.routes.collection import router as collection_router
from app.api.routes.recommendation import router as recommendation_router
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


app.include_router(users_router)
app.include_router(auth_router)
app.include_router(collection_router)
app.include_router(recommendation_router)
