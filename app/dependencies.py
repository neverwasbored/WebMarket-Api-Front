from fastapi import Request

from db.session import async_session
from app.core.jwt import verify_access_token


def get_current_user(request: Request):
    """Получает текущего пользователя из JWT-токена (если он есть)"""
    token = request.cookies.get("access_token")
    if not token:
        return None

    payload = verify_access_token(token)
    if not payload:
        return None

    return payload


async def get_session():
    async with async_session() as session:
        yield session
