from fastapi import HTTPException, status


class AlreadyAuthenticatedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={'type': 'error', 'msg': 'Вы уже авторизованы!'}
        )


class LoginOrPassNotMatchedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={'type': 'error', 'msg': 'Неверный логин или пароль.'}
        )


class NotAuthenticatedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={'type': 'error', 'msg': 'Вы не авторизованы.'}
        )
