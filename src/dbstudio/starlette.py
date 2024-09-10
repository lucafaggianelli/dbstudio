from datetime import timedelta
from pathlib import Path

from pydantic.version import VERSION as pydantic_version
from sqlalchemy import Engine, MetaData
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route
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


def get_startlette_mount(engine: Engine):
    metadata = MetaData()
    metadata.reflect(bind=engine)

    is_pydantic_v1 = pydantic_version.startswith("1.")

    def api_route(request):
        schema = get_db_schema(metadata)
        return JSONResponse(schema.dict() if is_pydantic_v1 else schema.model_dump())

    return Mount(
        "/dbstudio",
        routes=[
            Route(
                "/api/schema",
                api_route,
                methods=["GET"],
            ),
            Route("/", SPAStaticFiles(ignore_prefixes=["/api"])),
        ],
    )
