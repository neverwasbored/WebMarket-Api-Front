import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

from PIL import Image
from fastapi import HTTPException


async def validate_file_extension_async(filename: str):
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    ext = os.path.splitext(filename)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail={
                'type': 'error',
                'msg': f'Неподдерживаемый формат файла: {ext}. Разрешены: {", ".join(ALLOWED_EXTENSIONS)}'
            }
        )


async def convert_to_webp_async(file_path: str) -> str:
    def convert():
        with Image.open(file_path) as img:
            img = img.convert("RGB")
            webp_path = file_path.rsplit(".", 1)[0] + ".webp"
            img.save(webp_path, "WEBP", optimize=True, quality=80)

        if not file_path.lower().endswith(".webp"):
            try:
                os.remove(file_path)
            except OSError as e:
                print(f"Не удалось удалить файл {file_path}: {e}")

        normalized_path = os.path.normpath(webp_path)
        prefix = os.path.normpath("app/front")  # "app/front"

        if normalized_path.startswith(prefix):
            short_path = normalized_path[len(prefix)+1:]
        else:
            short_path = normalized_path

        return short_path

    return await asyncio.get_event_loop().run_in_executor(None, convert)
