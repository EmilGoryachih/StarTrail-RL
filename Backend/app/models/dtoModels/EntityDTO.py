from pydantic import BaseModel


class Entity(BaseModel):
    class Config:
        from_attributes = True

