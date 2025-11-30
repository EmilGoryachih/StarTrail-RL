from typing import Optional
from pydantic import BaseModel, Field

class POIOutDTO(BaseModel):
    id: str
    name: str
    type: str
    city: str
    lat: float
    lon: float
    score: float = Field(..., description="FAISS similarity score")
    description: str

    source: Optional[str] = Field(
        default=None,
        description="origin of recommendation: semantic | rl | explore",
    )
    ucb_score: Optional[float] = Field(
        default=None, description="UCB score used for RL reranking"
    )
    avg_reward: Optional[float] = Field(
        default=None, description="average reward for this POI for the user"
    )
    shown_count: Optional[int] = Field(
        default=None, description="how many times this POI appeared in user feedback"
    )
