"""
MONOPOL STUDIO — AI Microservice
FastAPI service for computationally intensive AI tasks:
- Background removal (rembg / Segment Anything)
- Image preprocessing & optimization
- Character vectorization
- Asset metadata extraction
"""

import asyncio
import io
import os
import logging
import uuid
from typing import Optional

import httpx
import numpy as np
from PIL import Image, ImageEnhance
from fastapi import FastAPI, File, HTTPException, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

import cv2

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="MONOPOL AI Services", version="1.0.0", description="AI processing microservice for MONOPOL STUDIO")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── S3 Config ────────────────────────────────────────────────────────────────

import boto3
s3_client = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION", "auto"),
    endpoint_url=os.getenv("S3_ENDPOINT"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)
S3_BUCKET = os.getenv("S3_BUCKET", "monopol-studio")
CDN_URL = os.getenv("CDN_URL", "")

_rembg_session = None

def get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        try:
            from rembg import new_session
            _rembg_session = new_session("u2net")
            logger.info("rembg model loaded")
        except ImportError:
            logger.warning("rembg not available, using fallback")
    return _rembg_session

class BackgroundRemovalRequest(BaseModel):
    image_url: str
    generation_id: str
    callback_url: Optional[str] = None
    model: str = "rembg"

async def download_image(url: str) -> Image.Image:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url)
        response.raise_for_status()
    return Image.open(io.BytesIO(response.content)).convert("RGBA")

def preprocess_image(img: Image.Image, max_size: int = 2048) -> Image.Image:
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass
    w, h = img.size
    if max(w, h) > max_size:
        ratio = max_size / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    if img.mode == "RGB":
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.1)
    return img

def remove_background_rembg(img: Image.Image) -> Image.Image:
    from rembg import remove
    session = get_rembg_session()
    rgb_img = img.convert("RGB")
    return remove(rgb_img, session=session, alpha_matting=True, alpha_matting_foreground_threshold=240)

def remove_background_simple(img: Image.Image) -> Image.Image:
    rgb = np.array(img.convert("RGB"))
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    result = img.convert("RGBA")
    from PIL import Image as PILImage
    mask_pil = PILImage.fromarray(mask).convert("L")
    result.putalpha(mask_pil)
    return result

def upload_to_s3(buffer: bytes, key: str, content_type: str = "image/png") -> str:
    s3_client.put_object(Bucket=S3_BUCKET, Key=key, Body=buffer, ContentType=content_type)
    if CDN_URL:
        return f"{CDN_URL}/{key}"
    return s3_client.generate_presigned_url("get_object", Params={"Bucket": S3_BUCKET, "Key": key}, ExpiresIn=3600 * 24 * 7)

async def send_callback(callback_url: str, payload: dict) -> None:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(callback_url, json=payload)
    except Exception as e:
        logger.error(f"Callback failed: {e}")

async def process_background_removal(image_url: str, generation_id: str, callback_url: Optional[str]) -> None:
    result_url = None
    error = None
    try:
        logger.info(f"[{generation_id}] Downloading image")
        img = await download_image(image_url)
        img = preprocess_image(img)
        try:
            result = remove_background_rembg(img)
        except Exception as e:
            logger.warning(f"[{generation_id}] rembg failed ({e}), using fallback")
            result = remove_background_simple(img)
        bbox = result.getbbox()
        if bbox:
            result = result.crop(bbox)
        padded = Image.new("RGBA", (result.width + 20, result.height + 20), (0, 0, 0, 0))
        padded.paste(result, (10, 10))
        buf = io.BytesIO()
        padded.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        s3_key = f"processed/{generation_id}/result.png"
        result_url = upload_to_s3(buf.getvalue(), s3_key, "image/png")
        logger.info(f"[{generation_id}] Uploaded to S3: {s3_key}")
    except Exception as e:
        error = str(e)
        logger.error(f"[{generation_id}] Pipeline error: {e}")
    if callback_url:
        await send_callback(callback_url, {
            "generation_id": generation_id,
            "status": "success" if result_url else "error",
            "result_url": result_url,
            "progress": 100 if result_url else 0,
            "error": error,
        })

@app.get("/health")
async def health():
    return {"status": "ok", "service": "monopol-ai", "version": "1.0.0"}

@app.post("/api/remove-background")
async def remove_background_endpoint(request: BackgroundRemovalRequest, background_tasks: BackgroundTasks):
    """Async background removal — queues processing, delivers result via callback_url."""
    background_tasks.add_task(process_background_removal, request.image_url, request.generation_id, request.callback_url)
    return {"generation_id": request.generation_id, "status": "processing", "message": "Background removal queued"}

@app.post("/api/remove-background/sync")
async def remove_background_sync(file: UploadFile = File(...)):
    """Synchronous background removal (small images / testing). Returns PNG directly."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGBA")
        img = preprocess_image(img)
        try:
            result = remove_background_rembg(img)
        except Exception:
            result = remove_background_simple(img)
        buf = io.BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        return StreamingResponse(buf, media_type="image/png", headers={"Content-Disposition": "attachment; filename=extracted.png"})
    except Exception as e:
        logger.error(f"Sync bg removal error: {e}")
        raise HTTPException(500, str(e))



@app.post("/api/extract-character")
async def extract_character(file: UploadFile = File(...)):
    """Extract character from image"""
    try:
        contents = await file.read()
        # TODO: Implement character extraction
        return {
            "status": "success",
            "character_id": "char-123",
            "url": "https://..."
        }
    except Exception as e:
        logger.error(f"Character extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-scene")
async def generate_scene(prompt: str):
    """Generate scene using AI"""
    try:
        # TODO: Implement scene generation with DALL-E, Midjourney, or Stability
        return {
            "status": "generating",
            "scene_id": "scene-123",
            "prompt": prompt
        }
    except Exception as e:
        logger.error(f"Scene generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process-status/{process_id}")
async def process_status(process_id: str):
    """Check processing status"""
    # TODO: Implement status check with Redis
    return {
        "process_id": process_id,
        "status": "completed",
        "result": {}
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
