# app/api/routes/RLRouter.py
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.models.dtoModels.POIOutDTO import POIOutDTO
from app.models.dtoModels.RLFeedbackDTO import RLFeedbackDTO
from app.models.dtoModels.UserDTO import UserOutDTO
from app.services.AuthorizationService import get_current_user_service
from app.services.POIService import POIService, poi_service
from app.services.RLService import RLService

router = APIRouter()


def get_poi_service() -> POIService:
    return poi_service


@router.get(
    "/recommendations",
    response_model=List[POIOutDTO],
    summary="RL-powered recommendations with exploration",
)
async def rl_recommendations(
    limit: int = Query(10, ge=1, le=50),
    current_user: UserOutDTO = Depends(get_current_user_service),
    session: AsyncSession = Depends(fastapi_get_db),
    poi: POIService = Depends(get_poi_service),
):
    service = RLService(poi_service=poi, session=session)
    return await service.recommend(
        user_id=current_user.id,
        interests=current_user.interests,
        additional_interests=current_user.additional_interests,
        city=current_user.city,
        limit=limit,
    )


@router.post(
    "/feedback",
    status_code=201,
    summary="Send reward signal for RL agent",
)
async def rl_feedback(
    dto: RLFeedbackDTO,
    current_user: UserOutDTO = Depends(get_current_user_service),
    session: AsyncSession = Depends(fastapi_get_db),
    poi: POIService = Depends(get_poi_service),
):
    service = RLService(poi_service=poi, session=session)
    return await service.record_feedback(current_user.id, dto)
