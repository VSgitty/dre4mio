# MONOPOL STUDIO - API Documentation

## Base URL
```
https://api.monopolstudio.com/api
```

## Authentication

All requests require an Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## Endpoints

### Authentication

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "token": "jwt_token"
  }
}
```

#### Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "user_123",
    "token": "jwt_token"
  }
}
```

### Projects

#### List Projects
```http
GET /projects
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "name": "My Epic Scene",
      "description": "A cinematic masterpiece",
      "thumbnail": "https://...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My New Project",
  "description": "Optional description"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "proj_123",
    "name": "My New Project",
    "userId": "user_123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Project
```http
GET /projects/:projectId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "proj_123",
    "name": "My Project",
    "scenes": [...]
  }
}
```

### Scenes

#### Create Scene
```http
POST /scenes
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "proj_123",
  "name": "Opening Scene",
  "duration": 30,
  "fps": 30,
  "width": 1920,
  "height": 1080
}

Response 201:
{
  "success": true,
  "data": {
    "id": "scene_123",
    "projectId": "proj_123",
    "name": "Opening Scene",
    "duration": 30
  }
}
```

### Assets

#### Upload Asset
```http
POST /assets/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>

Response 201:
{
  "success": true,
  "data": {
    "id": "asset_123",
    "name": "image.png",
    "url": "https://s3.example.com/asset_123.png",
    "type": "image",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Rendering

#### Start Render Job
```http
POST /render/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "sceneId": "scene_123",
  "format": "mp4",
  "quality": "1080p"
}

Response 202:
{
  "success": true,
  "data": {
    "jobId": "render_123",
    "status": "queued",
    "progress": 0
  }
}
```

#### Get Render Status
```http
GET /render/jobs/:jobId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "jobId": "render_123",
    "status": "processing",
    "progress": 45,
    "estimatedTime": 120
  }
}
```

### AI Services

#### Remove Background
```http
POST /ai/remove-background
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>

Response 201:
{
  "success": true,
  "data": {
    "processId": "proc_123",
    "status": "processing"
  }
}
```

#### Generate Scene
```http
POST /ai/generate-scene
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "A futuristic cityscape at sunset",
  "style": "cinematic",
  "resolution": "1920x1080"
}

Response 201:
{
  "success": true,
  "data": {
    "sceneId": "scene_123",
    "status": "generating",
    "estimatedTime": 60
  }
}
```

#### AI Director Chat
```http
POST /ai/director/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Make the character jump",
  "sceneId": "scene_123",
  "context": {}
}

Response 200:
{
  "success": true,
  "data": {
    "response": "I'll add a jump animation to the character...",
    "action": "animate",
    "parameters": {}
  }
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('https://api.monopolstudio.com', {
  auth: { token: 'jwt_token' }
});
```

### Subscribe to Project
```javascript
socket.emit('join-project', { projectId: 'proj_123' });
```

### Scene Updates
```javascript
socket.on('scene-updated', (data) => {
  console.log('Scene updated:', data);
});

// Broadcast update
socket.emit('scene-update', {
  projectId: 'proj_123',
  sceneId: 'scene_123',
  changes: { ... }
});
```

### Render Progress
```javascript
socket.on('render-progress', (data) => {
  console.log('Render progress:', data.progress);
});
```

## Error Handling

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token",
    "statusCode": 401
  }
}
```

### Error Codes
- `UNAUTHORIZED` (401) - Invalid/missing token
- `FORBIDDEN` (403) - No permission
- `NOT_FOUND` (404) - Resource not found
- `BAD_REQUEST` (400) - Invalid request
- `CONFLICT` (409) - Duplicate resource
- `RATE_LIMITED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## Rate Limiting

- **Free Plan**: 100 requests/minute
- **Creator Plan**: 500 requests/minute
- **Studio Plan**: Unlimited

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## Pagination

```http
GET /projects?page=1&limit=10&sort=createdAt&order=desc

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

**MONOPOL STUDIO - API Documentation**
