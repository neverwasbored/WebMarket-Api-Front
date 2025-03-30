from fastapi import Depends, Request

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import async_session
from db.models import User
from app.core.jwt import verify_access_token


async def get_session():
    async with async_session() as session:
        yield session


async def get_current_user(request: Request, session: AsyncSession = Depends(get_session)):
    """Получает текущего пользователя из JWT-токена (если он есть)"""
    token = request.cookies.get("access_token")
    if not token:
        return None

    payload = verify_access_token(token)
    if not payload:
        return None

    user = await session.scalar(select(User).where(User.id == payload.get('id')))

    if not user:
        return None

    return user
