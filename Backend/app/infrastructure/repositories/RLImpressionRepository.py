from typing import List, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select

from app.models.dbModels.RLImpression import RLImpression


class RLImpressionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_bulk(self, user_id: UUID, poi_ids: List[str]) -> None:
        if not poi_ids:
            return
        entities = [RLImpression(user_id=user_id, poi_id=pid) for pid in poi_ids]
        self.session.add_all(entities)
        await self.session.commit()

    async def impressions_stats(self) -> Tuple[int, int]:
        total_stmt = select(func.count(RLImpression.id))
        unique_stmt = select(func.count(func.distinct(RLImpression.poi_id)))

        total_res = await self.session.execute(total_stmt)
        unique_res = await self.session.execute(unique_stmt)

        total = total_res.scalar() or 0
        unique = unique_res.scalar() or 0
        return int(total), int(unique)
