from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError

from app.api.routes.auth import router as auth_router
from app.api.routes.collection import router as collection_router
from app.api.routes.recommendation import router as recommendation_router
from app.api.routes.users import router as users_router
from app.core.config import settings
from app.core.error_handlers import (
    http_exception_handler,
    unexpected_exception_handler,
    validation_exception_handler,
)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
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
