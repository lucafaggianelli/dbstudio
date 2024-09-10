from fastapi import FastAPI
from sqlalchemy import MetaData, Engine

from dbstudio.schema import get_db_schema
from dbstudio.starlette import SPAStaticFiles


def get_fastapi_router(engine: Engine):
    metadata = MetaData()
    metadata.reflect(bind=engine)

    router = FastAPI()

    @router.get("/api/schema")
    def get_schema():
        return get_db_schema(metadata)

    router.mount(
        "/",
        SPAStaticFiles(ignore_prefixes=["/api"]),
    )

    return router
