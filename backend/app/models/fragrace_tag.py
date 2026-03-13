from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FragranceTag(Base):
    __tablename__ = "fragrance_tags"

    fragrance_id: Mapped[int] = mapped_column(
        ForeignKey("fragrances.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )
