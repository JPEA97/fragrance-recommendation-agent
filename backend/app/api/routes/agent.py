import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps.current_user import get_current_user
from app.db.deps import get_db
from app.models.agent_session import AgentSession
from app.models.user import User
from app.schemas.common import ItemEnvelope
from app.services.agent import MODEL, run_agent

router = APIRouter(prefix="/agent", tags=["agent"])
logger = logging.getLogger(__name__)


class AgentRequest(BaseModel):
    query: str


class FragrancePick(BaseModel):
    brand: str
    name: str


class AgentResponse(BaseModel):
    response: str
    session_id: int
    picks: list[FragrancePick]


@router.post("/recommend", response_model=ItemEnvelope)
def agent_recommend(
    payload: AgentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.query.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Query cannot be empty",
        )

    try:
        final_response, steps, picks = run_agent(
            query=payload.query,
            db=db,
            user_id=current_user.id,
        )
    except Exception as e:
        logger.error("Agent run failed user_id=%s error=%s", current_user.id, str(e))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Agent failed to generate a recommendation",
        )

    session = AgentSession(
        user_id=current_user.id,
        query=payload.query,
        steps=steps,
        final_response=final_response,
        model_used=MODEL,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    logger.info(
        "Agent session saved user_id=%s session_id=%s",
        current_user.id,
        session.id,
    )

    return ItemEnvelope(
        data=AgentResponse(response=final_response, session_id=session.id, picks=picks)
    )
