from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.user import User
from db.models.rating import Rating

from app.api.schemas.base_response import APISuccessResponse, APISuccessResponseData
from app.api.schemas.rating_schema import GetRatingsResponse, GetUserRatingData, GetUserRatingsData, RateProductSchema

from app.dependencies import get_current_user, get_session
from app.exceptions import Forbiden, NotAuthenticatedException


router = APIRouter()


@router.post('/{product_id}', response_model=APISuccessResponse)
async def rate_product(
    product_id: int,
    data: RateProductSchema = Depends(RateProductSchema.as_form),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    existing_rating = await session.scalar(
        select(Rating)
        .where(
            Rating.user_id == current_user.id,
            Rating.product_id == product_id
        )
    )
    if data.rating == 0:
        if existing_rating:
            await session.delete(existing_rating)

    if data.rating > 0:
        if existing_rating:
            existing_rating.rating = data.rating

        if not existing_rating:
            new_rating = Rating(
                user_id=current_user.id,
                product_id=product_id,
                rating=data.rating
            )
            session.add(new_rating)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Invalid product or user")

    return {
        'type': 'success',
        'msg': 'Рейтинг успешно опубликован!',
    }


@router.get('/{product_id}', response_model=APISuccessResponseData[GetRatingsResponse])
async def get_ratings(
    product_id: int,
    session: AsyncSession = Depends(get_session)
):
    ratings = await session.scalars(select(Rating).where(Rating.product_id == product_id))
    ratings_list = ratings.all()

    rating_values = [r.rating for r in ratings_list]

    return {
        'type': 'success',
        'msg': 'Успешно получены данные!',
        'data': {
            'product_id': product_id,
            'ratings': rating_values
        }
    }


@router.get('/{product_id}/user/{user_id}', response_model=APISuccessResponseData[GetUserRatingData])
async def get_user_rating(
    product_id: int,
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    if current_user.id != user_id:
        raise Forbiden()

    rating = await session.scalar(
        select(Rating)
        .where(
            Rating.product_id == product_id,
            Rating.user_id == user_id
        )
    )
    if rating:
        return {
            'type': 'success',
            'msg': 'Успешно получена оценка пользователя!',
            'data': {
                'rating': rating.rating
            }
        }
    else:
        return {
            'type': 'success',
            'msg': 'Успешно получена оценка пользователя!',
            'data': {
                'rating': None
            }
        }


@router.get('/user/{user_id}', response_model=APISuccessResponseData[GetUserRatingsData])
async def get_user_ratings(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    if current_user.id != user_id:
        raise Forbiden()

    ratings = await session.scalars(
        select(Rating)
        .where(
            Rating.user_id == user_id
        )
    )
    ratings_list = ratings.all()
    ratings_formatted = [(rating.product_id, rating.rating)
                         for rating in ratings_list]

    return {
        'type': 'success',
        'msg': 'Успешно получены оценки пользователя!',
        'data': {
            'ratings': ratings_formatted
        }
    }
