from datetime import datetime
from typing import Annotated, Optional

from fastapi import Form
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, EmailStr, ValidationError


class GetUserSchema(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime


class UpdateUserSchema(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[
        Annotated[str, Form(min_length=3, max_length=30)]
    ] = None
    password: Optional[
        Annotated[str, Form(min_length=6, max_length=30)]
    ] = None
    confirm_password: Optional[
        Annotated[str, Form(min_length=6, max_length=30)]
    ] = None

    model_config = ConfigDict(extra='forbid')

    @classmethod
    def as_form(
        cls,
        email: Optional[Annotated[EmailStr, Form(None)]] = None,
        username: Optional[
            Annotated[str, Form(None, min_length=3, max_length=30)]
        ] = None,
        password: Optional[
            Annotated[str, Form(None, min_length=6, max_length=30)]
        ] = None,
        confirm_password: Optional[
            Annotated[str, Form(None, min_length=6, max_length=30)]
        ] = None,
    ):
        try:
            return cls(
                email=email,
                username=username,
                password=password,
                confirm_password=confirm_password,
            )
        except ValidationError as e:
            raise RequestValidationError(e.errors())
