from datetime import datetime

from pydantic import BaseModel


class GetUserSchema(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
