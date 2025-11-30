# app/models/dbModels/RLImpression.py
from uuid import uuid4
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.models.dbModels.Entity import EntityDB


class RLImpression(EntityDB):
    __tablename__ = "rl_impressions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)
    user_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    poi_id = Column(String, nullable=False, index=True)
    shown_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "poi_id": self.poi_id,
            "shown_at": self.shown_at.isoformat() if self.shown_at else None,
        }
