from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
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

router = APIRouter(prefix="/collection", tags=["collection"])


@router.post(
    "/", response_model=CollectionItemResponse, status_code=status.HTTP_201_CREATED
)
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
    return item


@router.get("/", response_model=list[CollectionItemDetailResponse])
def get_collection(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    brand: Optional[str] = None,
    ownership_type: Optional[str] = Query(
        default=None,
        pattern="^(full_bottle|decant|sample)$",
    ),
    min_rating: Optional[int] = Query(default=None, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(CollectionItem, Fragrance, Brand)
        .join(Fragrance, CollectionItem.fragrance_id == Fragrance.id)
        .join(Brand, Fragrance.brand_id == Brand.id)
        .filter(CollectionItem.user_id == current_user.id)
    )

    if brand:
        query = query.filter(Brand.name.ilike(f"%{brand}%"))

    if ownership_type:
        query = query.filter(CollectionItem.ownership_type == ownership_type)

    if min_rating is not None:
        query = query.filter(CollectionItem.personal_rating >= min_rating)

    rows = (
        query.order_by(CollectionItem.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
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


@router.patch("/{collection_item_id}", response_model=CollectionItemResponse)
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
    return item


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

    db.delete(item)
    db.commit()
