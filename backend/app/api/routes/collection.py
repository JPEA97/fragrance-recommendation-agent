import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps.current_user import get_current_user
from app.db.deps import get_db
from app.models.brand import Brand
from app.models.collection_item import CollectionItem
from app.models.fragrance import Fragrance
from app.models.user import User
from app.schemas.collection import (
    CollectionItemCreate,
    CollectionItemDetailResponse,
    CollectionItemResponse,
    CollectionItemUpdate,
)
from app.schemas.common import ItemEnvelope, ListEnvelope, MetaResponse

router = APIRouter(prefix="/collection", tags=["collection"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=ItemEnvelope, status_code=status.HTTP_201_CREATED)
def add_to_collection(
    payload: CollectionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = CollectionItem(
        user_id=current_user.id,
        fragrance_id=payload.fragrance_id,
        ownership_type=payload.ownership_type,
        ml_remaining=payload.ml_remaining,
        personal_rating=payload.personal_rating,
    )

    db.add(item)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item already exists or fragrance is invalid",
        )

    db.refresh(item)

    logger.info(
        "Collection item created user_id=%s collection_item_id=%s fragrance_id=%s",
        current_user.id,
        item.id,
        item.fragrance_id,
    )

    return ItemEnvelope(
        data=CollectionItemResponse(
            id=item.id,
            fragrance_id=item.fragrance_id,
            ownership_type=item.ownership_type,
            ml_remaining=item.ml_remaining,
            personal_rating=item.personal_rating,
            times_worn=item.times_worn,
            created_at=item.created_at,
        )
    )


@router.get("/", response_model=ListEnvelope)
def get_collection(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    brand: Optional[str] = None,
    query: Optional[str] = None,
    ownership_type: Optional[str] = Query(
        default=None,
        pattern="^(full_bottle|decant|sample)$",
    ),
    min_rating: Optional[int] = Query(default=None, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_query = (
        db.query(CollectionItem, Fragrance, Brand)
        .join(Fragrance, CollectionItem.fragrance_id == Fragrance.id)
        .join(Brand, Fragrance.brand_id == Brand.id)
        .filter(CollectionItem.user_id == current_user.id)
    )

    if query:
        term = f"%{query.strip()}%"
        db_query = db_query.filter(
            or_(
                Fragrance.name.ilike(term),
                Brand.name.ilike(term),
            )
        )
    elif brand:
        db_query = db_query.filter(Brand.name.ilike(f"%{brand}%"))

    if ownership_type:
        db_query = db_query.filter(CollectionItem.ownership_type == ownership_type)

    if min_rating is not None:
        db_query = db_query.filter(CollectionItem.personal_rating >= min_rating)

    rows = (
        db_query.order_by(CollectionItem.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = [
        CollectionItemDetailResponse(
            id=item.id,
            ownership_type=item.ownership_type,
            ml_remaining=item.ml_remaining,
            personal_rating=item.personal_rating,
            times_worn=item.times_worn,
            created_at=item.created_at,
            fragrance={
                "id": fragrance.id,
                "name": fragrance.name,
                "brand": brand_row.name,
            },
        )
        for item, fragrance, brand_row in rows
    ]

    return ListEnvelope(
        data=items,
        meta=MetaResponse(
            limit=limit,
            offset=offset,
            count=len(items),
        ),
    )


@router.get("/{collection_item_id}", response_model=ItemEnvelope)
def get_collection_item(
    collection_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (
        db.query(CollectionItem, Fragrance, Brand)
        .join(Fragrance, CollectionItem.fragrance_id == Fragrance.id)
        .join(Brand, Fragrance.brand_id == Brand.id)
        .filter(
            CollectionItem.id == collection_item_id,
            CollectionItem.user_id == current_user.id,
        )
        .first()
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection item not found",
        )

    item, fragrance, brand_row = row

    return ItemEnvelope(
        data=CollectionItemDetailResponse(
            id=item.id,
            ownership_type=item.ownership_type,
            ml_remaining=item.ml_remaining,
            personal_rating=item.personal_rating,
            times_worn=item.times_worn,
            created_at=item.created_at,
            fragrance={
                "id": fragrance.id,
                "name": fragrance.name,
                "brand": brand_row.name,
            },
        )
    )


@router.patch("/{collection_item_id}", response_model=ItemEnvelope)
def update_collection_item(
    collection_item_id: int,
    payload: CollectionItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(CollectionItem)
        .filter(
            CollectionItem.id == collection_item_id,
            CollectionItem.user_id == current_user.id,
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection item not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(item, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid collection item update",
        )

    db.refresh(item)

    logger.info(
        "Collection item updated user_id=%s collection_item_id=%s",
        current_user.id,
        item.id,
    )

    return ItemEnvelope(
        data=CollectionItemResponse(
            id=item.id,
            fragrance_id=item.fragrance_id,
            ownership_type=item.ownership_type,
            ml_remaining=item.ml_remaining,
            personal_rating=item.personal_rating,
            times_worn=item.times_worn,
            created_at=item.created_at,
        )
    )


@router.delete("/{collection_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection_item(
    collection_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(CollectionItem)
        .filter(
            CollectionItem.id == collection_item_id,
            CollectionItem.user_id == current_user.id,
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection item not found",
        )

    logger.info(
        "Collection item deleted user_id=%s collection_item_id=%s",
        current_user.id,
        item.id,
    )

    db.delete(item)
    db.commit()
