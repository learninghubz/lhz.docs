---
sidebar_position: 3
title: API Design
description: RESTful API design patterns and conventions
---

# API Design Patterns

LearningHubz follows REST principles and modern API design patterns for a consistent and intuitive developer experience.

## API Conventions

### URL Structure
```
https://api.learninghubz.com/{version}/{resource}/{id}
```

Example:
```
GET /v1/courses/123
POST /v1/users
PUT /v1/courses/123
DELETE /v1/courses/123
```

### Versioning
API versioning is handled through the URL path:
- Current version: `v1`
- Future versions: `v2`, `v3`, etc.

## Request/Response Format

### Standard Request Headers
```http
Content-Type: application/json
Authorization: Bearer {token}
Accept: application/json
```

### Standard Response Structure
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Course Title"
  },
  "meta": {
    "timestamp": "2026-02-23T10:00:00Z",
    "version": "1.0"
  }
}
```

### Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request payload is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## HTTP Methods

### GET - Retrieve Resources
```javascript
// Get all courses
GET /v1/courses

// Get specific course
GET /v1/courses/123

// Get with query parameters
GET /v1/courses?status=active&limit=10
```

### POST - Create Resources
```javascript
POST /v1/courses
Content-Type: application/json

{
  "title": "New Course",
  "description": "Course description"
}
```

### PUT - Update Resources
```javascript
PUT /v1/courses/123
Content-Type: application/json

{
  "title": "Updated Course Title",
  "description": "Updated description"
}
```

### DELETE - Remove Resources
```javascript
DELETE /v1/courses/123
```

## Pagination

Large collections use cursor-based pagination:

```javascript
GET /v1/courses?limit=20&cursor=eyJpZCI6IjEyMyJ9

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 20,
    "nextCursor": "eyJpZCI6IjE0MyJ9",
    "hasMore": true
  }
}
```

## Filtering and Sorting

### Filtering
```javascript
GET /v1/courses?status=active&category=programming
```

### Sorting
```javascript
GET /v1/courses?sort=-createdAt,title
// - prefix for descending, no prefix for ascending
```

## Status Codes

- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request payload
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

Rate limits are enforced per API key:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

Subscribe to events using webhooks:

```javascript
POST /v1/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["course.created", "user.enrolled"]
}
```

## Next Steps

- [API Reference](/docs/api-reference) - Explore specific API endpoints
- [System Overview](./overview) - Understand the architecture
- [Data Modeling](./data-modeling) - Learn about data structures
