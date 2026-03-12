from datetime import datetime

from sqlalchemy import DateTime, String, CheckConstraint, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Tag(Base):
    __tablename__ = "tags"

    __table_args__ = (
        UniqueConstraint("type", "name", name="uq_tags_type_name"),
        CheckConstraint(
            "type IN ('season', 'occasion', 'time_of_day', 'weather', 'location_type', 'accord', 'note')",
            name="ck_tags_type_valid",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
