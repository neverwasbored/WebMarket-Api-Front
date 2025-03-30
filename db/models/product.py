from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, func
from sqlalchemy.orm import relationship
from db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    media = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    cart_items = relationship(
        "CartItem",
        back_populates="product",
        cascade="all, delete-orphan"
    )
