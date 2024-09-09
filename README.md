# DB Studio

DB Studio is a web-based database management tool that allows you to manage your databases, tables, and data. It is designed to be simple and easy to use, with a clean and intuitive user interface.

DB Studio is currently compatible with FastAPI and SQLAlchemy or SQLModel.

```
pip install dbstudio
```

## Get started

After configuring DB Studio, the UI will be available at `/dbstudio`.

### FastAPI

```python
from fastapi import FastAPI
from dbstudio import DBStudio

# Be sure to import your DB models before initializing DBStudio
import .models

app = FastAPI()

app.mount("/", get_fastapi_router(Base.metadata))
```