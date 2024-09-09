from datetime import timedelta
from pathlib import Path

from sqlalchemy import MetaData
from starlette.exceptions import HTTPException
from starlette.staticfiles import StaticFiles

from dbstudio.schema import get_db_schema


_FRONTEND_FOLDER = Path(__file__).parent / "static"
_STATIC_FILES_CACHE_TIME = int(timedelta(days=7).total_seconds())


class SPAStaticFiles(StaticFiles):
    def __init__(
        self, ignore_prefixes: list[str], directory: Path | str | None = None
    ) -> None:
        super().__init__(directory=directory or _FRONTEND_FOLDER, html=True)

        self.ignore_prefixes = [prefix.lstrip("/") for prefix in ignore_prefixes]

    def _should_ignore_path(self, path: str) -> bool:
        for prefix in self.ignore_prefixes:
            if path.startswith(prefix):
                return True

        return False

    async def get_response(self, path: str, scope):
        try:
            response = await super().get_response(path, scope)

            if (
                not self._should_ignore_path(path)
                # when url path is /
                and not path == "."
                and not path.endswith(".html")
            ):
                response.headers["Cache-Control"] = (
                    f"max-age={_STATIC_FILES_CACHE_TIME}"
                )

            return response
        except HTTPException as ex:
            if not self._should_ignore_path(path) and ex.status_code == 404:
                response = await super().get_response("index.html", scope)

                response.headers["Cache-Control"] = "no-cache"

                return response
            else:
                raise ex


def get_fastapi_router(metadata: MetaData):
    from fastapi import FastAPI

    router = FastAPI()

    @router.get("/dbstudio/api/schema")
    def get_schema():
        return get_db_schema(metadata)

    router.mount(
        "/dbstudio",
        SPAStaticFiles(ignore_prefixes=["/api"]),
    )

    return router
