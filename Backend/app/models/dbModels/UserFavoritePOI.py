from uuid import UUID
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.models.dbModels.Entity import EntityDB


class UserFavoritePOI(EntityDB):
    __tablename__ = "user_favorite_pois"

    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), primary_key=True, nullable=False)
    poi_id = Column(String, primary_key=True, nullable=False)

    def to_dict(self) -> dict:
        return {
            "user_id": str(self.user_id),
            "poi_id": self.poi_id,
        }