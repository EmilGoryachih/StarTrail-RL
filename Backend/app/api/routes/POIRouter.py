# app/api/routes/POIRouter.py
from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.models.dtoModels.POIOutDTO import POIOutDTO
from app.models.dtoModels.UserDTO import UserOutDTO
from app.services.AuthorizationService import get_current_user_service
from app.services.POIService      import POIService, poi_service

router = APIRouter()

def get_poi_service() -> POIService:
    return poi_service

@router.get("", response_model=List[POIOutDTO])
def search_poi(
    current_user: UserOutDTO = Depends(get_current_user_service),
    q:    str                 = Query(..., alias="q"),
    city: Optional[str]       = None,
    limit: int                = Query(10, ge=1, le=50),
    service: POIService       = Depends(get_poi_service),
    tags: Optional[List[str]] = None,
):
    """
    Search POIs by free-text query and optional city filter.
    """
    return service.search_in_city(query=q, city=city, top_n=limit)

@router.get(
    "/recommendations",
    response_model=List[POIOutDTO],
    summary="Recommend POIs for the current user's interests",
)
def recommend_poi(
    current_user: UserOutDTO = Depends(get_current_user_service),
    service:      POIService = Depends(get_poi_service),
    limit:        int        = Query(10, ge=1, le=50),
):
    """
    Возвращает до `limit` персональных рекомендаций для аутентифицированного пользователя,
    на основе его `current_user.interests`, `current_user.additional_interests` и `current_user.city`.
    """
    return service.recommend_by_interests(
        interests=current_user.interests,
        additional_interests=current_user.additional_interests,
        city=current_user.city,
        top_n=limit,
    )
