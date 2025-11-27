from pydantic import BaseModel

class POIOutDTO(BaseModel):
    id: str
    name: str
    type: str
    city: str
    lat: float
    lon: float
    score: float
    description: str
