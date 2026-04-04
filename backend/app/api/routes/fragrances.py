from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.brand import Brand
from app.models.fragrance import Fragrance
from app.schemas.common import ItemEnvelope, ListEnvelope, MetaResponse
from app.schemas.fragrance import FragranceDetailResponse, FragranceListItemResponse

router = APIRouter(prefix="/fragrances", tags=["fragrances"])


def normalize_text_expr(column):
    return func.replace(
        func.replace(func.unaccent(column), "'", ""),
        " ",
        "",
    )


@router.get("/", response_model=ListEnvelope)
def list_fragrances(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    brand: Optional[str] = None,
    search: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db),
):
    db_query = db.query(Fragrance, Brand).join(Brand, Fragrance.brand_id == Brand.id)

    if query:
        normalized = query.strip().replace("'", "").replace(" ", "")
        db_query = db_query.filter(
            or_(
                normalize_text_expr(Fragrance.name).ilike(f"%{normalized}%"),
                normalize_text_expr(Brand.name).ilike(f"%{normalized}%"),
            )
        )
    else:
        if brand:
            normalized_brand = brand.strip().replace("'", "").replace(" ", "")
            db_query = db_query.filter(
                normalize_text_expr(Brand.name).ilike(f"%{normalized_brand}%")
            )

        if search:
            normalized_search = search.strip().replace("'", "").replace(" ", "")
            db_query = db_query.filter(
                normalize_text_expr(Fragrance.name).ilike(f"%{normalized_search}%")
            )

    rows = (
        db_query.order_by(Brand.name.asc(), Fragrance.name.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = [
        FragranceListItemResponse(
            id=fragrance.id,
            name=fragrance.name,
            brand=brand_row.name,
            release_year=fragrance.release_year,
            gender_category=fragrance.gender_category,
        )
        for fragrance, brand_row in rows
    ]

    return ListEnvelope(
        data=items,
        meta=MetaResponse(
            limit=limit,
            offset=offset,
            count=len(items),
        ),
    )


@router.get("/{fragrance_id}", response_model=ItemEnvelope)
def get_fragrance_detail(
    fragrance_id: int,
    db: Session = Depends(get_db),
):
    row = (
        db.query(Fragrance, Brand)
        .join(Brand, Fragrance.brand_id == Brand.id)
        .filter(Fragrance.id == fragrance_id)
        .first()
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fragrance not found",
        )

    fragrance, brand_row = row

    return ItemEnvelope(
        data=FragranceDetailResponse(
            id=fragrance.id,
            name=fragrance.name,
            brand=brand_row.name,
            release_year=fragrance.release_year,
            gender_category=fragrance.gender_category,
            description=fragrance.description,
        )
    )
