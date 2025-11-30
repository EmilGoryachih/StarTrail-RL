from typing import Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select

from app.models.dbModels.RLRequestLog import RLRequestLog


class RLRequestLogRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, user_id: UUID | None, latency_ms: float) -> None:
        entity = RLRequestLog(user_id=user_id, latency_ms=latency_ms)
        self.session.add(entity)
        await self.session.commit()

    async def latency_stats(self) -> Tuple[float, int]:
        stmt = select(func.avg(RLRequestLog.latency_ms), func.count(RLRequestLog.id))
        res = await self.session.execute(stmt)
        avg_latency, count = res.fetchone()
        return float(avg_latency or 0.0), int(count or 0)
