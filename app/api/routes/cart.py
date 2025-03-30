from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import select, delete, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.base_response import APISuccessResponse
from db.models.cart_item import CartItem
from db.models.product import Product
from db.models.user import User
from app.dependencies import get_session, get_current_user
from app.api.schemas.cart_schema import CartItemListResponse, AddToCartSchema, CartItemOutResponse
from app.exceptions import NotAuthenticatedException

router = APIRouter()


@router.post('/', response_model=CartItemOutResponse)
async def add_to_cart(
    payload: AddToCartSchema,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    product = await session.scalar(select(Product).where(Product.id == payload.product_id))

    if not product:
        raise HTTPException(
            status_code=404,
            detail={
                'type': 'error',
                'msg': "Товар не найден"
            }
        )

    cart_item = await session.scalar(
        select(CartItem)
        .where(
            and_(
                CartItem.user_id == current_user.id,
                CartItem.product_id == payload.product_id
            )
        )
        .options(selectinload(CartItem.product))
    )

    if cart_item:
        cart_item.quantity += payload.quantity
        if cart_item.quantity < 1:
            await session.delete(cart_item)
            await session.commit()
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "type": "success",
                    "msg": "Товар удалён из корзины"
                }
            )
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=payload.product_id,
            quantity=payload.quantity
        )
        session.add(cart_item)

    await session.commit()

    await session.refresh(cart_item, ["product"])

    return cart_item


@router.get('/', response_model=CartItemListResponse)
async def get_cart(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    items = await session.scalars(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .options(selectinload(CartItem.product))
    )
    items_list = items.all()
    if not items:
        return {
            "type": "success",
            "msg": "Корзина получена",
            "data": []
        }

    return {
        "type": "success",
        "msg": "Корзина получена",
        "data": items_list
    }


@router.delete('/{product_id}', response_model=APISuccessResponse)
async def remove_from_cart(
    product_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    product = await session.scalar(
        select(CartItem)
        .where(
            and_(
                CartItem.user_id == current_user.id,
                CartItem.product_id == product_id
            )
        )
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'type': 'error',
                'msg': 'Данного товара нет в корзине.'
            }
        )

    await session.delete(product)
    await session.commit()
    return {"type": "success", "msg": "Товар удалён из корзины"}
