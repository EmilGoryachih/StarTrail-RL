# app/models/dtoModels/RLFeedbackDTO.py
from pydantic import BaseModel, Field


class RLFeedbackDTO(BaseModel):
    """
    Feedback payload from frontend to update RL rewards.
    """
    poi_id: str = Field(..., description="POI identifier")
    reward: float = Field(..., description="Reward signal (-1..1 or any float)")
