from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import DeclarativeBase
from fastapi import FastAPI

from dbstudio.fastapi import get_fastapi_router


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    fullname = Column(String)
    nickname = Column(String)


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True)
    email_address = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    shipping_address_id = Column(Integer, ForeignKey("addresses.id"))
    billing_address_id = Column(Integer, ForeignKey("addresses.id"))


app = FastAPI()

app.mount("/", get_fastapi_router(Base.metadata))
