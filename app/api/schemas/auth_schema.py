from typing import Annotated

from fastapi import Form
from fastapi.exceptions import RequestValidationError

from pydantic import BaseModel, ConfigDict, EmailStr, ValidationError


class LoginSchema(BaseModel):
    email: EmailStr
    password: Annotated[str, Form(..., min_length=6, max_length=30)]

    model_config = ConfigDict(extra='forbid')

    @classmethod
    def as_form(
        cls,
        email: Annotated[EmailStr, Form(...)],
        password: Annotated[str, Form(..., min_length=6, max_length=30)]
    ):
        try:
            return cls(email=email, password=password)
        except ValidationError as e:
            raise RequestValidationError(e.errors())


class RegisterSchema(LoginSchema):
    username: Annotated[str, Form(..., min_length=3, max_length=30)]
    confirm_password: Annotated[str, Form(..., min_length=6, max_length=30)]

    @classmethod
    def as_form(
        cls,
        email: Annotated[EmailStr, Form(...)],
        password: Annotated[str, Form(..., min_length=6, max_length=30)],
        username: Annotated[str, Form(..., min_length=3, max_length=30)],
        confirm_password: Annotated[str,
                                    Form(..., min_length=6, max_length=30)]
    ):
        try:
            return cls(
                email=email,
                password=password,
                username=username,
                confirm_password=confirm_password
            )
        except ValidationError as e:
            raise RequestValidationError(e.errors())


class AuthOutSchema(BaseModel):
    access_token: str

    model_config = ConfigDict(from_attributes=True)
