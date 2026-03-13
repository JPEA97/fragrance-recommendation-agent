from datetime import datetime
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CollectionItem(Base):
    __tablename__ = "collection_items"

    __table_args__ = (
        UniqueConstraint(
            "user_id", "fragrance_id", name="uq_collection_user_fragrance"
        ),
        CheckConstraint(
            "ownership_type IN ('full_bottle', 'decant', 'sample')",
            name="ck_collection_ownership_type_valid",
        ),
        CheckConstraint(
            "ml_remaining IS NULL OR ml_remaining >= 0",
            name="ck_collection_ml_remaining_positive",
        ),
        CheckConstraint(
            "personal_rating IS NULL OR personal_rating BETWEEN 1 AND 10",
            name="ck_collection_personal_rating_range",
        ),
        CheckConstraint("times_worn >= 0", name="ck_collection_times_worn_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    fragrance_id: Mapped[int] = mapped_column(
        ForeignKey("fragrances.id"), nullable=False
    )

    ownership_type: Mapped[str] = mapped_column(String(20), nullable=False)
    ml_remaining: Mapped[float] = mapped_column(Numeric(6, 2), nullable=True)
    personal_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    last_worn_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    times_worn: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
