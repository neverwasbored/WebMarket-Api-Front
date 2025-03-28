from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, SmallInteger, UniqueConstraint
from sqlalchemy.orm import relationship

from db.base import Base


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rating = Column(SmallInteger, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="user_product_unique"),
    )

    # Опциональные связи
    user = relationship("User", backref="ratings")
    product = relationship("Product", backref="ratings")
