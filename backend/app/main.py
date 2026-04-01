import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.collection import router as collection_router
from app.api.routes.recommendation import router as recommendation_router
from app.api.routes.users import router as users_router
from app.api.routes.fragrances import router as fragrances_router

from app.core.config import settings
from app.core.error_handlers import (
    http_exception_handler,
    unexpected_exception_handler,
    validation_exception_handler,
)
from app.core.logging_config import configure_logging

configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Starting application name=%s version=%s debug=%s",
        settings.app_name,
        settings.app_version,
        settings.debug,
    )
    yield
    logger.info("Shutting down application")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unexpected_exception_handler)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(users_router)
app.include_router(auth_router)
app.include_router(collection_router)
app.include_router(recommendation_router)
app.include_router(fragrances_router)
