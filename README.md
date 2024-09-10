# DB Studio

A web-based database management tool that allows you to manage your databases, tables, and data.

It is designed to be embedded into your Python web applications, is currently compatible with FastAPI,
Starlette, SQLAlchemy and SQLModel.

## Get started

Install DB Studio from PyPI using pip or your favorite package manager:

```sh
pip install dbstudio
```

After configuring DB Studio, the UI will be available at `http://<your-server>/dbstudio`.

## FastAPI

```python
from fastapi import FastAPI
from dbstudio.fastapi import get_fastapi_router

# Be sure to import your DB models before initializing DBStudio
import .models

app = FastAPI()

# The router must be mounted at /dbstudio
app.mount("/dbstudio", get_fastapi_router(engine))
```

## Starlette

```python
from starlette.applications import Starlette
from dbstudio.starlette import get_startlette_mount

# Be sure to import your DB models before initializing DBStudio
import .models

app = Starlette(
    routes=[get_startlette_mount(engine)],
)
```
