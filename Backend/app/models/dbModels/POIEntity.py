# app/models/dbModels/POIEntity.py
from sqlalchemy import Column, String, Float, Text, ARRAY
from app.models.dbModels.Entity import EntityDB

class POIEntity(EntityDB):
    __tablename__ = "pois"

    id                     = Column(String, primary_key=True, nullable=False)
    name                   = Column(String, nullable=False)
    type                   = Column(String, nullable=True)
    city                   = Column(String, nullable=True)
    lat                    = Column(Float, nullable=True)
    lon                    = Column(Float, nullable=True)
    tags = Column(ARRAY(String))
    enriched_description   = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "city": self.city,
            "lat": self.lat,
            "lon": self.lon,
            "tags": self.tags,
            "description": self.enriched_description,
        }
