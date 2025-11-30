# app/models/dbModels/RLRequestLog.py
from uuid import uuid4
from datetime import datetime, timezone

from sqlalchemy import Column, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.models.dbModels.Entity import EntityDB


class RLRequestLog(EntityDB):
    __tablename__ = "rl_request_logs"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4, nullable=False)
    user_id = Column(PGUUID(as_uuid=True), nullable=True, index=True)
    latency_ms = Column(Float, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "user_id": str(self.user_id) if self.user_id else None,
            "latency_ms": float(self.latency_ms),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
