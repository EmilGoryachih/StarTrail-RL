# app/api/routes/RLRouter.py
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from uuid import UUID
import time

from app.infrastructure.db.session import fastapi_get_db
from app.models.dtoModels.POIOutDTO import POIOutDTO
from app.models.dtoModels.RLFeedbackDTO import RLFeedbackDTO
from app.models.dtoModels.UserDTO import UserOutDTO
from app.services.AuthorizationService import get_current_user_service
from app.services.POIService import POIService, poi_service
from app.services.POIService import df as poi_df
from app.models.dbModels.RLInteraction import RLInteraction
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
    start = time.perf_counter()
    service = RLService(poi_service=poi, session=session)
    recs = await service.recommend(
        user_id=current_user.id,
        interests=current_user.interests,
        additional_interests=current_user.additional_interests,
        city=current_user.city,
        limit=limit,
    )
    # логируем латентность
    try:
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        await service.request_log_repo.add(user_id=current_user.id, latency_ms=elapsed_ms)
    except Exception:
        pass
    return recs


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


@router.get(
    "/metrics",
    summary="Basic RL metrics: latency, coverage, avg_reward, CTR (feedback/impressions)",
)
async def rl_metrics(
    session: AsyncSession = Depends(fastapi_get_db),
    poi: POIService = Depends(get_poi_service),
):
    service = RLService(poi_service=poi, session=session)

    # latency stats
    avg_latency_ms, latency_count = await service.request_log_repo.latency_stats()

    # impressions stats
    total_impressions, unique_impressions = await service.impression_repo.impressions_stats()
    total_poi = len(poi_df.index)
    coverage = (unique_impressions / total_poi) * 100 if total_poi else 0.0

    # reward stats
    res = await session.execute(
        func.count(RLInteraction.id),
    )
    total_feedback = res.scalar() or 0
    reward_sum_res = await session.execute(func.sum(RLInteraction.reward))
    reward_sum_val = reward_sum_res.scalar() or 0.0
    # CTR (приближение): total_feedback / total_impressions
    ctr = (total_feedback / total_impressions) * 100 if total_impressions else 0.0
    avg_reward = reward_sum_val / total_feedback if total_feedback else 0.0

    return {
        "latency": {"avg_ms": avg_latency_ms, "count": latency_count},
        "coverage": {"unique_poi_percent": coverage, "unique_poi": unique_impressions, "total_poi": total_poi},
        "impressions": total_impressions,
        "feedback_count": total_feedback,
        "avg_reward": avg_reward,
        "ctr_percent": ctr,
        "note": "Regret не вычисляется онлайн; CTR здесь приближен как feedback/impressions.",
    }
