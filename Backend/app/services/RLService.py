import math
from typing import List, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.RLInteractionRepository import RLInteractionRepository
from app.infrastructure.repositories.RLImpressionRepository import RLImpressionRepository
from app.infrastructure.repositories.RLRequestLogRepository import RLRequestLogRepository
from app.models.dtoModels.POIOutDTO import POIOutDTO
from app.models.dtoModels.RLFeedbackDTO import RLFeedbackDTO
from app.services.POIService import POIService


class RLService:
    """
    Lightweight RL layer:
    - collects feedback
    - ranks candidate POIs with UCB-style exploration
    """

    def __init__(self, poi_service: POIService, session: AsyncSession, exploration: float = 1.2):
        self.poi_service = poi_service
        self.session = session
        self.repo = RLInteractionRepository(session)
        self.impression_repo = RLImpressionRepository(session)
        self.request_log_repo = RLRequestLogRepository(session)
        self.exploration = exploration

    async def record_feedback(self, user_id: UUID, dto: RLFeedbackDTO) -> dict:
        return await self.repo.add(user_id=user_id, poi_id=dto.poi_id, reward=dto.reward)

    async def recommend(
        self,
        user_id: UUID,
        interests: list,
        additional_interests: str | None,
        city: str | None,
        limit: int = 10,
        min_feedback: int = 3,
    ) -> List[POIOutDTO]:
        candidate_pool_size = max(limit * 5, 20)
        candidates = self.poi_service.recommend_by_interests(
            interests=interests,
            additional_interests=additional_interests,
            city=city,
            top_n=candidate_pool_size,
        )

        if not candidates:
            return []

        stats, total = await self.repo.get_user_stats(user_id)

        if total < min_feedback:
            enriched: List[POIOutDTO] = []
            for poi in candidates[:limit]:
                enriched.append(
                    POIOutDTO(
                        **poi.dict(),
                        source="semantic",
                        ucb_score=None,
                        avg_reward=None,
                        shown_count=None,
                    )
                )
            return enriched

        scored: List[Tuple[float, POIOutDTO, Tuple[int, float]]] = []
        for poi in candidates:
            cnt, reward_sum = stats.get(poi.id, (0, 0.0))
            if cnt == 0:
                ucb = float("inf")
                avg_reward = 0.0
                source = "explore"
            else:
                avg_reward = reward_sum / cnt
                ucb = avg_reward + self.exploration * math.sqrt(math.log(total) / cnt)
                source = "rl"
            scored.append((ucb, poi, (cnt, avg_reward, source)))

        scored.sort(key=lambda x: (x[0] if math.isfinite(x[0]) else float("inf")), reverse=True)

        enriched: List[POIOutDTO] = []
        for ucb, poi, (cnt, avg_reward, source) in scored[:limit]:
            enriched.append(
                POIOutDTO(
                    **poi.dict(),
                    source=source,
                    ucb_score=None if not math.isfinite(ucb) else float(ucb),
                    avg_reward=float(avg_reward),
                    shown_count=int(cnt),
                )
            )

        try:
            await self.impression_repo.add_bulk(user_id, [p.id for p in enriched])
        except Exception:
            pass

        return enriched
