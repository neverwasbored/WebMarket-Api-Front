import os
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .api.utils.env_sync import env_sync
from .api.routes import router as api_router


load_dotenv()
UPLOAD_DIR = os.getenv('UPLOAD_DIR')
HOST = os.getenv('HOST')

env_sync()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[HOST],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
path_to_build = os.path.join(os.path.dirname(
    __file__), '..', 'react-app', 'build')

app.mount(
    "/static",
    StaticFiles(
        directory=os.path.join(path_to_build, 'static')
    ),
    name="static"
)
app.mount(
    "/files",
    StaticFiles(
        directory=os.path.join(os.path.dirname(__file__), "..", "file_storage")
    ),
    name="files"
)

app.include_router(api_router)


@app.get("/{full_path:path}", response_class=HTMLResponse)
def server_spa():
    with open(os.path.join(path_to_build, 'index.html'), 'r', encoding='utf-8') as file:
        html_content = file.read()
    return HTMLResponse(content=html_content, status_code=200)
