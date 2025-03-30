import os
import aiofiles
from uuid import uuid4
from dotenv import load_dotenv

from fastapi import APIRouter, Depends, Query, status, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.base_response import APISuccessResponse, APISuccessResponseData
from db.models.rating import Rating
from db.models.user import User
from db.models.product import Product
from app.api.schemas.products_schema import ProductListResponse, ProductOutSchema, ProductSchema
from app.api.utils.photo_utils import validate_file_extension_async, convert_to_webp_async
from app.dependencies import get_current_user, get_session
from app.exceptions import Forbiden, NotAuthenticatedException


router = APIRouter()


@router.get("/", response_model=ProductListResponse)
async def get_products(
    session: AsyncSession = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    offset = (page - 1) * page_size

    total = await session.scalar(
        select(func.count())
        .select_from(Product)
    )

    products = await session.scalars(
        select(Product)
        .offset(offset)
        .limit(page_size)
    )

    return {
        "type": "success",
        "msg": "Продукты успешно получены",
        "data": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": products
        }
    }


@router.post('/', response_model=APISuccessResponse)
async def create_product(
    form_data: ProductSchema = Depends(ProductSchema.as_form),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    load_dotenv()
    UPLOAD_DIR = os.getenv('UPLOAD_DIR')

    photo = form_data.media
    if not photo.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'type': 'error',
                'msg': 'Картинка должна быть изображением.'
            }
        )

    file_ext = os.path.splitext(photo.filename)[-1]
    filename = f"{uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    await validate_file_extension_async(filename=filename)

    async with aiofiles.open(file_path, "wb") as out_file:
        while content := await photo.read(1024 * 1024):
            await out_file.write(content)

    file_path_webp = await convert_to_webp_async(file_path=file_path)

    # Загрузка в базу данных
    product = Product(
        name=form_data.name,
        description=form_data.description,
        price=form_data.price,
        media=file_path_webp
    )

    session.add(product)
    await session.commit()
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            'type': 'success',
            'msg': 'Продукт успешно загружен!'
        }
    )


@router.get('/{product_id}', response_model=APISuccessResponseData[ProductOutSchema])
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
):
    product = await session.scalar(
        select(Product)
        .where(Product.id == product_id)
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'type': 'error',
                'msg': f"Продукт с id: {product_id} не существует."
            }
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            'type': 'success',
            'msg': f"Продукт с id: {product_id} успешно найден!",
            'data': {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': float(product.price) if product.price else None,
                'media': product.media,
                'created_at': product.created_at.isoformat() if product.created_at else None,
                'updated_at': product.updated_at.isoformat() if product.updated_at else None
            }
        }
    )


@router.delete('/{product_id}', response_model=APISuccessResponse)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise NotAuthenticatedException()

    product = await session.scalar(select(Product).where(Product.id == product_id))
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'type': 'error',
                'msg': 'Данный товар не найден.'
            }
        )

    load_dotenv()
    ADMIN_IDS = os.getenv('REACT_APP_ADMIN_IDS').split(',')

    if str(current_user.id) not in ADMIN_IDS:
        raise Forbiden()

    await session.execute(
        delete(Rating).where(Rating.product_id == product_id)
    )

    await session.delete(product)
    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при удалении товара: {str(e)}"
        )

    return {
        'type': 'success',
        'msg': 'Товар успешно удалён!'
    }
