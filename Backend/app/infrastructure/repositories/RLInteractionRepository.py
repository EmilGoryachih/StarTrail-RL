from typing import Dict, Tuple, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.dbModels.RLInteraction import RLInteraction


class RLInteractionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, user_id: UUID, poi_id: str, reward: float) -> dict:
        entity = RLInteraction(user_id=user_id, poi_id=poi_id, reward=reward)
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity.to_dict()

    async def get_user_stats(self, user_id: UUID) -> Tuple[Dict[str, Tuple[int, float]], int]:
        """
        Returns per-poi (count, sum_reward) and total count for a user.
        """
        stmt = (
            select(
                RLInteraction.poi_id,
                func.count(RLInteraction.id),
                func.sum(RLInteraction.reward),
            )
            .where(RLInteraction.user_id == user_id)
            .group_by(RLInteraction.poi_id)
        )
        result = await self.session.execute(stmt)
        rows = result.all()

        stats: Dict[str, Tuple[int, float]] = {}
        total_count = 0
        for poi_id, cnt, total_reward in rows:
            stats[poi_id] = (int(cnt), float(total_reward or 0.0))
            total_count += int(cnt)

        return stats, total_count

    async def list_recent(self, user_id: UUID, limit: int = 50) -> List[dict]:
        stmt = (
            select(RLInteraction)
            .where(RLInteraction.user_id == user_id)
            .order_by(RLInteraction.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return [row.to_dict() for row in result.scalars().all()]
