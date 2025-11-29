from pydantic import BaseModel
from typing import Optional

class POIOutDTO(BaseModel):
    id: str
    name: str
    type: str
    city: str
    lat: float
    lon: float
    score: float
    description: str
    # RL metadata (optional, only for RL recommendations)
    source: Optional[str] = None  # "rl", "semantic", "explore"
    ucb_score: Optional[float] = None
    avg_reward: Optional[float] = None
    shown_count: Optional[int] = None
