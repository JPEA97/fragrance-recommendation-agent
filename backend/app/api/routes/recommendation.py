import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.current_user import get_current_user
from app.db.deps import get_db
from app.models.brand import Brand
from app.models.collection_item import CollectionItem
from app.models.fragrance import Fragrance
from app.models.fragrance_tag import FragranceTag
from app.models.tag import Tag
from app.models.user import User
from app.schemas.common import ListEnvelope, MetaResponse
from app.schemas.recommendation import (
    RecommendationFragranceResponse,
    RecommendationRequest,
)
from app.services.recommendation import build_recommendations

router = APIRouter(prefix="/recommendation", tags=["recommendation"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=ListEnvelope)
def recommend_fragrance(
    payload: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(CollectionItem, Fragrance, Brand, Tag)
        .join(Fragrance, CollectionItem.fragrance_id == Fragrance.id)
        .join(Brand, Fragrance.brand_id == Brand.id)
        .join(FragranceTag, FragranceTag.fragrance_id == Fragrance.id)
        .join(Tag, Tag.id == FragranceTag.tag_id)
        .filter(CollectionItem.user_id == current_user.id)
        .all()
    )
    # Recommendation candidates are limited to fragrances with tag mappings.
    # Untagged fragrances are intentionally excluded from recommendation scoring.

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User collection is empty",
        )

    selected = build_recommendations(rows, payload)

    if not selected:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recommendation candidates found",
        )

    logger.info(
        "Recommendation generated user_id=%s result_count=%s",
        current_user.id,
        len(selected),
    )

    recommendations = [
        RecommendationFragranceResponse(
            id=entry["fragrance"].id,
            name=entry["fragrance"].name,
            brand=entry["brand"].name,
            reason=entry["reason"],
        )
        for entry in selected
    ]

    return ListEnvelope(
        data=recommendations,
        meta=MetaResponse(count=len(recommendations)),
    )
