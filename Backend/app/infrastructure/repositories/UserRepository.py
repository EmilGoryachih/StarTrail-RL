from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.UserEntity import UserEntity as User


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def find_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_by_id(self, user_id: UUID) -> Optional[dict]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        obj = result.scalar_one_or_none()
        return obj.to_dict() if obj else None

    async def find_all(self) -> List[dict]:
        stmt = select(User)
        result = await self.session.execute(stmt)
        return [u.to_dict() for u in result.scalars().all()]

    async def add_user(self, entity: User) -> dict:
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity.to_dict()

    async def set_role(self, user_id: UUID, role) -> Optional[dict]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.role = role
        await self.session.commit()
        await self.session.refresh(user)
        return user.to_dict()

    async def update_interests(self, user_id: UUID, interests: List[str]):
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.interests = interests
        await self.session.commit()

    async def update_city(self, user_id: UUID, city: str):
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.city = city
        await self.session.commit()

    async def update_additional_interests(self, user_id: UUID, additional_interests: str):
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.additional_interests = additional_interests
        await self.session.commit()

    async def update_about_me(self, user_id: UUID, about_me: str):
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.about_me = about_me
        await self.session.commit()


    async def get_interests(self, user_id: UUID) -> List[str]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        return user.interests

