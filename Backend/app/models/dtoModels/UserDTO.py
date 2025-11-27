# app/models/dtoModels/UserDTO.py
from uuid import UUID
from typing import List

from pydantic import BaseModel, EmailStr, Field

from app.models.InterestsEnum import InterestsEnum

class UserCreateDTO(BaseModel):
    """
    Request body for user registration
    """
    first_name: str                 = Field(..., max_length=50, example="Alice")
    last_name:  str                 = Field(..., max_length=50, example="Smith")
    email:      EmailStr            = Field(..., example="alice@example.com")
    password:   str                 = Field(..., min_length=6, example="hunter2")
    city:       str                 = Field(..., max_length=50, example="Moscow")
    interests:  List[InterestsEnum] = Field(default_factory=list, example=["museums","parks"])
    about_me:   str                 = Field("", example="I love history and art.")
    additional_interests: str       = Field(..., max_length=200)

class UserOutDTO(BaseModel):
    """
    Response model for user data
    """
    id:                    UUID
    first_name:            str                 = Field(..., max_length=50)
    last_name:             str                 = Field(..., max_length=50)
    email:                 EmailStr
    city:                  str                 = Field(..., max_length=50)
    interests:             List[InterestsEnum] = Field(default_factory=list)
    about_me:              str                 = Field("", example="…")
    additional_interests: str       = Field(..., max_length=200)

    class Config:
        orm_mode = True
