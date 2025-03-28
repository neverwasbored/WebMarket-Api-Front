from fastapi import APIRouter

from .auth import router as auth_router
from .products import router as products_router
from .cart import router as cart_router
from .user import router as user_router


router = APIRouter()

router.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Auth"]
)

router.include_router(
    products_router,
    prefix='/api/products',
    tags=['Products']
)

router.include_router(
    cart_router,
    prefix='/api/cart',
    tags=['Cart']
)

router.include_router(
    user_router,
    prefix='/api/user',
    tags=['User']
)
