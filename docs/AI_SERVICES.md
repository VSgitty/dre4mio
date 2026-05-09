# MONOPOL STUDIO - AI Services Integration

## Overview

AI Services handle all machine learning and video processing tasks. They run as a separate microservice to allow independent scaling and resource allocation.

## Services

### 1. Background Removal

**Endpoint:** `POST /api/remove-background`

**Input:**
- Image file (JPEG, PNG, WebP)
- Optional: model selection (SAM, REMBG)

**Process:**
1. Image upload
2. Model inference
3. Alpha channel generation
4. Optimization
5. PNG export

**Output:**
```json
{
  "processId": "proc_123",
  "status": "completed",
  "imageUrl": "https://...",
  "processingTime": 2.5
}
```

### 2. Character Extraction

**Endpoint:** `POST /api/extract-character`

**Process:**
1. Detect character boundaries
2. Segment from background
3. Create transparent PNG
4. Optimize file size
5. Generate thumbnail

**Output:**
```json
{
  "characterId": "char_123",
  "url": "https://...",
  "bbox": [10, 20, 300, 400],
  "thumbnail": "https://..."
}
```

### 3. Scene Generation

**Endpoint:** `POST /api/generate-scene`

**Input:**
```json
{
  "prompt": "A futuristic cityscape at sunset",
  "style": "cinematic",
  "resolution": "1920x1080",
  "model": "stable-diffusion"
}
```

**Process:**
1. Prompt enhancement
2. Model selection
3. Image generation
4. Post-processing
5. Upload to storage

**Output:**
```json
{
  "sceneId": "scene_123",
  "url": "https://...",
  "generationTime": 15,
  "prompt": "..."
}
```

### 4. Video Rendering

**Endpoint:** `POST /api/render`

**Input:**
```json
{
  "sceneId": "scene_123",
  "clips": [...],
  "format": "mp4",
  "quality": "1080p",
  "fps": 30
}
```

**Process:**
1. Validate scene data
2. Queue job in Redis
3. Remotion composition setup
4. FFmpeg rendering
5. Post-processing
6. Upload to S3

**Output:**
```json
{
  "renderId": "render_123",
  "jobId": "job_456",
  "status": "queued",
  "estimatedTime": 120
}
```

## Setup

### Local Development

```bash
cd apps/ai-services

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=sk-...
export REPLICATE_API_TOKEN=...

# Start server
python main.py
```

### Docker

```bash
docker build -t monopol-ai:latest .
docker run -p 5000:5000 \
  -e OPENAI_API_KEY=sk-... \
  -e REPLICATE_API_TOKEN=... \
  monopol-ai:latest
```

## Configuration

### Environment Variables

```env
# AI APIs
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=...
STABILITY_API_KEY=...

# Storage
S3_BUCKET=monopol-assets
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Cache & Queue
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

## Models

### Segment Anything Model (SAM)

Used for background removal and character extraction.

```python
from segment_anything import sam_model_registry

# Load model
sam = sam_model_registry["vit_b"](checkpoint="sam_vit_b_01ec64.pth")

# Perform segmentation
masks = sam.predict(image)
```

### DALL-E 3

Used for scene generation.

```python
import openai

response = openai.Image.create(
  prompt="A futuristic city",
  model="dall-e-3",
  n=1,
  size="1024x1024"
)
```

### Stable Diffusion

For faster, cheaper image generation.

```python
import replicate

output = replicate.run(
  "stability-ai/stable-diffusion",
  input={
    "prompt": "A beautiful landscape",
    "num_inference_steps": 50
  }
)
```

### Remotion

For video rendering.

```typescript
import { Composition } from "remotion";

export const MyComposition = () => (
  <Composition
    id="MyComp"
    component={MyComponent}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);
```

## Performance Optimization

### Caching

```python
from functools import lru_cache
import redis

redis_client = redis.Redis(host='localhost')

@lru_cache(maxsize=1000)
def expensive_operation(key):
    # Check cache first
    cached = redis_client.get(key)
    if cached:
        return cached
    
    # Compute result
    result = compute()
    redis_client.setex(key, 3600, result)
    return result
```

### Batch Processing

```python
# Process multiple images efficiently
def batch_remove_background(images):
    results = []
    for batch in chunk(images, batch_size=4):
        with torch.no_grad():
            outputs = model(batch)
        results.extend(outputs)
    return results
```

### GPU Acceleration

```bash
# Install CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Verify GPU
python -c "import torch; print(torch.cuda.is_available())"
```

## Monitoring

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "models": {
    "sam": "loaded",
    "openai": "available"
  },
  "redis": "connected"
}
```

### Metrics

```http
GET /metrics
```

Returns Prometheus metrics:
- Request counts
- Processing times
- Error rates
- Model load times

## Scaling

### Horizontal Scaling

```bash
# Run multiple instances
python main.py &
python main.py &
python main.py &

# Behind load balancer
nginx config -> localhost:5000, localhost:5001, localhost:5002
```

### Job Queue

```python
from celery import Celery

app = Celery('monopol')
app.config_from_object('celeryconfig')

@app.task
def process_image(image_url):
    # Long-running task
    result = expensive_operation(image_url)
    return result
```

## Troubleshooting

### Out of Memory

```bash
# Reduce batch size
export BATCH_SIZE=1

# Use smaller models
export MODEL_SIZE=small
```

### Slow Inference

```bash
# Check GPU usage
nvidia-smi

# Profile code
python -m cProfile -s cumtime main.py
```

### API Errors

```bash
# Check logs
tail -f logs/ai-services.log

# Test endpoint
curl -X POST http://localhost:5000/api/remove-background \
  -F "file=@image.png"
```

## Integration with Frontend

```typescript
// Upload image for processing
const uploadForProcessing = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/ai/remove-background', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { processId } = await response.json();
  
  // Poll for status
  return pollProcessingStatus(processId);
};

// Check status
const pollProcessingStatus = async (processId: string) => {
  return new Promise(resolve => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/ai/process/${processId}`);
      const { status, result } = await response.json();
      
      if (status === 'completed') {
        clearInterval(interval);
        resolve(result);
      }
    }, 1000);
  });
};
```

---

**MONOPOL STUDIO - AI Services**
