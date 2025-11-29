import math
from typing import List, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.RLInteractionRepository import RLInteractionRepository
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
    ) -> List[POIOutDTO]:
        # 1) candidate pool based on existing semantic recs (explore more than limit)
        candidate_pool_size = max(limit * 5, 20)
        candidates = self.poi_service.recommend_by_interests(
            interests=interests,
            additional_interests=additional_interests,
            city=city,
            top_n=candidate_pool_size,
        )

        if not candidates:
            return []

        # 2) stats from user feedback
        stats, total = await self.repo.get_user_stats(user_id)
        if total == 0:
            # Cold-start: no history, return top candidates as semantic recommendations
            result = []
            for poi in candidates[:limit]:
                # Create new DTO with metadata
                result.append(POIOutDTO(
                    **poi.model_dump(),
                    source="semantic",
                    ucb_score=None,
                    avg_reward=None,
                    shown_count=0
                ))
            return result

        scored: List[Tuple[float, POIOutDTO, int, float]] = []
        for poi in candidates:
            cnt, reward_sum = stats.get(poi.id, (0, 0.0))
            if cnt == 0:
                # unseen items: prioritize exploration
                ucb = float("inf")
                avg_reward = None
                source = "explore"
            else:
                avg_reward = reward_sum / cnt
                ucb = avg_reward + self.exploration * math.sqrt(math.log(total) / cnt)
                source = "rl"
            scored.append((ucb, poi, cnt, avg_reward or 0.0))

        # Sort by score (inf values bubble to top)
        scored.sort(key=lambda x: (x[0] if math.isfinite(x[0]) else float("inf")), reverse=True)
        
        result = []
        for ucb_score, poi, cnt, avg_reward in scored[:limit]:
            # Create new DTO with metadata
            result.append(POIOutDTO(
                **poi.model_dump(),
                source="explore" if not math.isfinite(ucb_score) else "rl",
                ucb_score=ucb_score if math.isfinite(ucb_score) else None,
                avg_reward=avg_reward if cnt > 0 else None,
                shown_count=cnt
            ))
        return result
