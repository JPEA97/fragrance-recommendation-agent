import logging

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.schemas.error import ErrorResponse, ErrorBody

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: HTTPException):
    payload = ErrorResponse(
        error=ErrorBody(
            type="http_error",
            message=str(exc.detail),
            details=None,
        )
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=payload.model_dump(),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    payload = ErrorResponse(
        error=ErrorBody(
            type="validation_error",
            message="Request validation failed",
            details=exc.errors(),
        )
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=payload.model_dump(),
    )


async def unexpected_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server error", exc_info=exc)

    payload = ErrorResponse(
        error=ErrorBody(
            type="internal_server_error",
            message="An unexpected error occurred",
            details=None,
        )
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=payload.model_dump(),
    )
