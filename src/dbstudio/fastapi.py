from fastapi import FastAPI
from sqlalchemy import MetaData

from dbstudio.schema import get_db_schema
from dbstudio.starlette import SPAStaticFiles


def get_fastapi_router(metadata: MetaData):
    router = FastAPI()

    @router.get("/dbstudio/api/schema")
    def get_schema():
        return get_db_schema(metadata)

    router.mount(
        "/dbstudio",
        SPAStaticFiles(ignore_prefixes=["/api"]),
    )

    return router
