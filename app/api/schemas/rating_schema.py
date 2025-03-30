from typing import Annotated, List, Tuple
from typing_extensions import Literal
from fastapi import Form
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from app.api.schemas.base_response import APISuccessResponse


class RateProductSchema(BaseModel):
    rating: int = Field(..., ge=0, le=5, description="Rating from 0 to 5")

    model_config = ConfigDict(extra='forbid')

    @classmethod
    def as_form(
        cls,
        rating: Annotated[int, Form(...)]
    ):
        try:
            return cls(rating=rating)
        except ValidationError as e:
            raise RequestValidationError(e.errors())


class GetRatingsResponse(BaseModel):
    product_id: int
    ratings: List[int]

    model_config = ConfigDict(from_attributes=True)


class GetUserRatingData(BaseModel):
    rating: int

    model_config = ConfigDict(from_attributes=True)


class GetUserRatingsData(BaseModel):
    ratings: List[Tuple[int, int]]

    model_config = ConfigDict(from_attributes=True)
