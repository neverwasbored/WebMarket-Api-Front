from fastapi import status, Response
from fastapi.responses import JSONResponse


async def create_auth_response(message: str, access_token: str):
    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            'type': 'success',
            'msg': message,
            'data': {'access_token': access_token}
        }
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # ← на проде True
        secure=False,
        samesite="lax"
    )

    return response
