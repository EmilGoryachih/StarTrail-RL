from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dtoModels.POIOutDTO import POIOutDTO
from app.infrastructure.repositories.FavoritePOIRepository import FavoritePOIRepository
from app.services.POIService import df


def _row_to_dto(poi_id: str) -> POIOutDTO:
    row = df.loc[poi_id]
    return POIOutDTO(
        id=poi_id,
        name=row["name"],
        type=row["type"],
        city=row["city"],
        lat=float(row["lat"]),
        lon=float(row["lon"]),
        score=0.0,
        description=row["enriched_description"],
    )


async def add_favorite(user_id: UUID, poi_id: str, session: AsyncSession) -> POIOutDTO:
    if poi_id not in df.index:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="POI not found")

    repo = FavoritePOIRepository(session)
    if await repo.exists(user_id, poi_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already in favorites")

    await repo.add(user_id, poi_id)
    return _row_to_dto(poi_id)


async def get_favorites(user_id: UUID, session: AsyncSession) -> List[POIOutDTO]:
    repo = FavoritePOIRepository(session)
    ids = await repo.get_user_poi_ids(user_id)
    result: List[POIOutDTO] = []
    for poi_id in ids:
        if poi_id in df.index:
            result.append(_row_to_dto(poi_id))
    return result