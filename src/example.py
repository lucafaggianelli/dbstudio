# Example file to test the integration with an HTTP Framework
#
# Launch with:
# PYTHONPATH=$(pwd) uvicorn example:app_fa --app-dir src --port 8000 --reload
# PYTHONPATH=$(pwd) uvicorn example:app_st --app-dir src --port 8000 --reload

from sqlalchemy import Column, Integer, String, ForeignKey, create_engine
from sqlalchemy.orm import DeclarativeBase, Session
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.applications import Starlette
from starlette.middleware import Middleware

from dbstudio.fastapi import get_fastapi_router
from dbstudio.starlette import get_startlette_mount


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


engine = create_engine("sqlite:///dbstudio.db")
Base.metadata.create_all(engine)

with Session(engine) as session:
    if session.query(User).count() == 0:
        session.add_all(
            [
                User(name="wendy", fullname="Wendy Williams", nickname="windy"),
                User(name="mary", fullname="Mary Contrary", nickname="mary"),
                User(name="fred", fullname="Fred Flintstone", nickname="freddy"),
            ]
        )
    session.commit()

# FastAPI
app_fa = FastAPI()

app_fa.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app_fa.mount("/dbstudio", get_fastapi_router(engine))

# Starlette
app_st = Starlette(
    routes=[get_startlette_mount(engine)],
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ],
)
