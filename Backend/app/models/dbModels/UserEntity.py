# app/models/dbModels/UserEntity.py
from uuid import UUID
from sqlalchemy import Column, String, ARRAY
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.types import Enum as SAEnum

from app.models.InterestsEnum import InterestsEnum
from app.models.dbModels.Entity import EntityDB

class UserEntity(EntityDB):
    __tablename__ = "users"

    id = Column(PGUUID(as_uuid=True), primary_key=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name  = Column(String(50), nullable=False)
    email      = Column(String(50), nullable=False, unique=True)
    hashed_password    = Column(String(200), nullable=False)
    city               = Column(String(50),  nullable=False)
    about_me           = Column(String(200), nullable=False, default="")
    interests          = Column(
        ARRAY(
            SAEnum(
                InterestsEnum,
                name="interests_enum",
                values_callable=lambda enum: [e.value for e in enum],
            )
        ),
        nullable=False,
        default=list,
    )
    additional_interests = Column(String(200), nullable=False, default="")

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "hashed_password": self.hashed_password,
            "city": self.city,
            "about_me": self.about_me,
            "interests": [i.value if isinstance(i, InterestsEnum) else i for i in self.interests],
            "additional_interests": self.additional_interests,
        }
