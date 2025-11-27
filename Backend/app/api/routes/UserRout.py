from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.models.dtoModels.POIOutDTO import POIOutDTO
from app.models.dtoModels.UserDTO import UserCreateDTO, UserOutDTO
from app.services.AuthorizationService import get_current_user_service
from app.services.POIService import POIService
from app.services.UserService import add_user, update_interests, update_city, update_additional_interests, \
    update_about_me, get_user_interests
from app.services.FavoriteService import add_favorite, get_favorites

router = APIRouter()


@router.post("/register", response_model=UserOutDTO, status_code=status.HTTP_201_CREATED)
async def register_endpoint(
    dto: UserCreateDTO,
    session: AsyncSession = Depends(fastapi_get_db),
):
    return await add_user(dto, session)


@router.put("/update_interests")
async def update_interests_endpoint(
    interests: list[str],
    session: AsyncSession = Depends(fastapi_get_db),
    current_user: UserOutDTO = Depends(get_current_user_service),
):
    await update_interests(current_user.id, interests, session)

@router.put("/update_city")
async def update_city_endpoint(
        city: str,
        session: AsyncSession = Depends(fastapi_get_db),
        current_user: UserOutDTO = Depends(get_current_user_service),
):
    await update_city(current_user.id, city, session)

@router.put("/update_additional_interests")
async def update_additional_interests_endpoint(
        interests: str,
        session: AsyncSession = Depends(fastapi_get_db),
        current_user: UserOutDTO = Depends(get_current_user_service),
):
    await update_additional_interests(current_user.id, interests, session)


@router.put("/update_about_me")
async def update_about_me_endpoint(
        about_me: str,
        session: AsyncSession = Depends(fastapi_get_db),
        current_user: UserOutDTO = Depends(get_current_user_service),
):
    await update_about_me(current_user.id, about_me, session)


@router.post("/favorites/{poi_id}", response_model=POIOutDTO, status_code=status.HTTP_201_CREATED)
async def add_poi_to_favorites_endpoint(
    poi_id: str,
    current_user: UserOutDTO = Depends(get_current_user_service),
    session: AsyncSession = Depends(fastapi_get_db),
):
    return await add_favorite(current_user.id, poi_id, session)


@router.get("/favorites", response_model=List[POIOutDTO])
async def get_user_favorites_endpoint(
    current_user: UserOutDTO = Depends(get_current_user_service),
    session: AsyncSession = Depends(fastapi_get_db),
):
    return await get_favorites(current_user.id, session)

@router.get("/interests", response_model=List[str])
async def get_user_interests_endpoint(
    current_user: UserOutDTO = Depends(get_current_user_service),
    num: int = 3,
    session: AsyncSession = Depends(fastapi_get_db),
):
    return await get_user_interests(current_user.id, num, session)
