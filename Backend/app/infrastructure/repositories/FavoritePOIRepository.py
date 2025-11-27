from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.UserFavoritePOI import UserFavoritePOI


class FavoritePOIRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, user_id: UUID, poi_id: str) -> dict:
        entity = UserFavoritePOI(user_id=user_id, poi_id=poi_id)
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity.to_dict()

    async def exists(self, user_id: UUID, poi_id: str) -> bool:
        stmt = select(UserFavoritePOI).where(
            UserFavoritePOI.user_id == user_id,
            UserFavoritePOI.poi_id == poi_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_user_poi_ids(self, user_id: UUID) -> List[str]:
        stmt = select(UserFavoritePOI.poi_id).where(UserFavoritePOI.user_id == user_id)
        result = await self.session.execute(stmt)
        return [row[0] for row in result.all()]