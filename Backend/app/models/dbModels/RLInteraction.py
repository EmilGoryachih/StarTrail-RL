# app/models/dbModels/RLInteraction.py
from uuid import uuid4
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.models.dbModels.Entity import EntityDB


class RLInteraction(EntityDB):
    """
    Stores user feedback for RL agent (explicit/implicit rewards per POI).
    """
    __tablename__ = "rl_interactions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)
    user_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    poi_id = Column(String, nullable=False, index=True)
    reward = Column(Float, nullable=False, default=0.0)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "poi_id": self.poi_id,
            "reward": self.reward,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
