# app/services/UserService.py
from typing import List
from uuid import uuid4, UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.UserRepository import UserRepository
from app.models.dbModels.UserEntity import UserEntity
from app.models.dtoModels.UserDTO import UserCreateDTO, UserOutDTO
from app.services.AuthorizationService import AuthService

async def add_user(dto: UserCreateDTO, session: AsyncSession) -> UserOutDTO:
    repo = UserRepository(session)

    if await repo.find_by_email(str(dto.email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with given email already exists",
        )

    hashed_pw = AuthService().get_password_hash(dto.password)

    entity = UserEntity(
        id=uuid4(),
        first_name=dto.first_name,
        last_name=dto.last_name,
        email=str(dto.email),
        hashed_password=hashed_pw,
        # ** new fields **
        city=dto.city,
        about_me=dto.about_me,
        interests=[i.value for i in dto.interests],
        additional_interests=dto.additional_interests,
    )

    saved = await repo.add_user(entity)
    # repo.add_user returns entity.to_dict(); pydantic will pick it up
    return UserOutDTO(**saved)


async def update_interests(user_id: UUID,interests: list[str], session: AsyncSession):
    repo = UserRepository(session)
    await repo.update_interests(user_id ,interests)

async def update_city(user_id: UUID, city: str, session: AsyncSession):
    repo = UserRepository(session)
    await repo.update_city(user_id, city)

async def update_additional_interests(user_id: UUID, interests: str, session: AsyncSession):
    repo = UserRepository(session)
    await repo.update_additional_interests(user_id, interests)

async def update_about_me(user_id: UUID, about_me: str, session: AsyncSession):
    repo = UserRepository(session)
    await repo.update_about_me(user_id, about_me)

async def get_user_interests(user_id: UUID, num: int, session: AsyncSession) -> List[str]:
    repo = UserRepository(session)
    result = await repo.get_interests(user_id)
    return result[:num]