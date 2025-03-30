from fastapi import APIRouter, Depends, Response, status, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.base_response import APISuccessResponseData
from app.api.utils.auth_utils import create_auth_response
from app.core.jwt import create_access_token
from db.models.user import User
from app.api.schemas.user_schema import GetUserSchema, UpdateUserSchema

from app.core.security import hash_password
from app.dependencies import get_current_user, get_session
from app.exceptions import Forbiden, NotAuthenticatedException


router = APIRouter()


@router.get('/me', response_model=GetUserSchema)
async def get_me(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException

    user = await session.scalar(select(User).where(User.id == current_user.id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'type': 'error',
                'msg': 'Пользователь не найден.'
            }
        )

    return user


@router.put('/update', response_model=APISuccessResponseData)
async def update_user(
    response: Response,
    form_data: UpdateUserSchema = Depends(UpdateUserSchema.as_form),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise NotAuthenticatedException()

    user = await session.scalar(select(User).where(User.id == current_user.id))

    if not user:
        raise Forbiden()

    if form_data.email:
        user.email = form_data.email

    if form_data.username:
        user.username = form_data.username

    if form_data.password or form_data.confirm_password:
        if not form_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    'type': 'error',
                    'msg': 'Вы хотели поменять пароль, но пропустили поле пароля.'
                }
            )

        if not form_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    'type': 'error',
                    'msg': 'Вы хотели поменять пароль, но пропустили поле подтверждения пароля.'
                }
            )

        if form_data.password != form_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    'type': 'error',
                    'msg': 'Пароли различаются.'
                }
            )

        user.hashed_password = hash_password(form_data.password)

    await session.commit()

    response.delete_cookie(key='access_token')

    access_token = create_access_token(
        data={
            "id": user.id,
            "username": user.username
        }
    )

    return await create_auth_response(
        message='Успешно поменяли данные!',
        access_token=access_token
    )
