from fastapi import APIRouter, Depends,  status, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.user_schema import GetUserSchema
from db.models.user import User

from app.dependencies import get_current_user, get_session
from app.exceptions import NotAuthenticatedException


router = APIRouter()


@router.get('/me', response_model=GetUserSchema)
async def get_me(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException

    user = await session.scalar(select(User).where(User.id == current_user.get('user_id')))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'type': 'error',
                'msg': 'Пользователь не найден.'
            }
        )

    return user
