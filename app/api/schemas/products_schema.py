from datetime import datetime
from typing import Annotated, List

from fastapi import Form, File, UploadFile
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, ValidationError

from app.api.schemas.base_response import APISuccessResponse


class ProductSchema(BaseModel):
    name: Annotated[str, Form(..., min_length=5, max_length=128)]
    description: Annotated[str, Form(..., min_length=32, max_length=512)]
    price: Annotated[float, Form(..., ge=0.01, le=999999999.99)]
    media: Annotated[UploadFile, Form(...)]

    model_config = ConfigDict(extra='forbid')

    @classmethod
    def as_form(
        cls,
        name: Annotated[str, Form(...)],
        description: Annotated[str, Form(...)],
        price: Annotated[float, Form(...)],
        media: Annotated[UploadFile, File(...)]
    ):
        try:
            return cls(name=name, description=description, price=price, media=media)
        except ValidationError as e:
            raise RequestValidationError(e.errors())


class ProductOutSchema(BaseModel):
    id: int
    name: str
    description: str
    price: float
    media: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedProductListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[ProductOutSchema]


class ProductListResponse(APISuccessResponse):
    data: PaginatedProductListResponse
