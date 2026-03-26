from typing import Any, Optional

from pydantic import BaseModel


class ErrorBody(BaseModel):
    type: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    error: ErrorBody
