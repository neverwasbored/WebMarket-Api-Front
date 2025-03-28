from typing import Generic, TypeVar
from typing_extensions import Literal

from pydantic import BaseModel


T = TypeVar("T")


class APISuccessResponseData(BaseModel, Generic[T]):
    type: Literal["success"]
    msg: str
    data: T


class APIErrorResponse(BaseModel):
    type: Literal["error"]
    msg: str


class APISuccessResponse(BaseModel):
    type: Literal["success"]
    msg: str
