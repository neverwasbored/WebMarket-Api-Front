from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.responses import JSONResponse
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.base_response import APISuccessResponse, APISuccessResponseData
from db.models import User
from app.core.jwt import create_access_token
from app.core.security import hash_password, verify_password
from app.api.utils.auth_utils import create_auth_response
from app.api.schemas.auth_schema import AuthOutSchema, RegisterSchema, LoginSchema
from app.dependencies import get_current_user, get_session
from app.exceptions import AlreadyAuthenticatedException, LoginOrPassNotMatchedException, NotAuthenticatedException


router = APIRouter()


@router.post('/register', response_model=APISuccessResponseData[AuthOutSchema])
async def register(
    form_data: RegisterSchema = Depends(RegisterSchema.as_form),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user:
        raise AlreadyAuthenticatedException()

    if form_data.password != form_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                'type': 'error',
                'msg': "Пароли не совпадают."
            }
        )

    user = await session.scalar(
        select(User).where(
            or_(
                User.username == form_data.username,
                User.email == form_data.email
            )
        )
    )

    if user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                'type': 'error',
                'msg': 'Юзер с этим email или username уже зарегистрирован!'
            }
        )

    user = User(
        email=form_data.email,
        username=form_data.username,
        hashed_password=hash_password(form_data.password)
    )

    session.add(user)
    await session.commit()

    access_token = create_access_token(
        data={
            "id": user.id,
            "username": user.username
        }
    )

    return await create_auth_response(message='Успешная регистрация!', access_token=access_token)


@router.post('/login', response_model=APISuccessResponseData[AuthOutSchema])
async def login(
    form_data: LoginSchema = Depends(LoginSchema.as_form),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user:
        raise AlreadyAuthenticatedException()

    user = await session.scalar(select(User).where(User.email == form_data.email))

    if not user:
        raise LoginOrPassNotMatchedException()

    password_validation = verify_password(
        plain_password=form_data.password,
        hashed_password=user.hashed_password
    )

    if not password_validation:
        raise LoginOrPassNotMatchedException()

    access_token = create_access_token(
        data={
            "id": user.id,
            "username": user.username
        }
    )

    return await create_auth_response(message='Вы успешно вошли!', access_token=access_token)


@router.post('/logout', response_model=APISuccessResponse)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    response.delete_cookie(key='access_token')

    return {
        'type': 'success',
        'msg': 'Вы успешно вышли из аккаунта!'
    }
