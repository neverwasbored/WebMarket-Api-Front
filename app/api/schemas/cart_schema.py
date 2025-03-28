from typing import Literal

from pydantic import BaseModel

from app.api.schemas.products_schema import ProductOutSchema


class CartItemOutResponse(BaseModel):
    id: int
    product: ProductOutSchema
    quantity: int

    model_config = {
        "from_attributes": True
    }


class AddToCartSchema(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemListResponse(BaseModel):
    type: Literal["success"]
    msg: str
    data: list[CartItemOutResponse]
