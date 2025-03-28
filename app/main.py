import os
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router as api_router


load_dotenv()
UPLOAD_DIR = os.getenv('UPLOAD_DIR')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('HOST')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory='app/front/static'), name="static")

app.include_router(api_router)


@app.get("/{full_path:path}", response_class=HTMLResponse)
def server_spa():
    with open(os.path.join(os.path.dirname(__file__), 'front/index.html'), 'r', encoding='utf-8') as file:
        html_content = file.read()
    return HTMLResponse(content=html_content, status_code=200)
