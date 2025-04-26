# RPG Archivist API Documentation

This document provides an overview of the API endpoints available in the RPG Archivist Web application.

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints, you need to include an `Authorization` header with a valid JWT token.

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Base URL

All API endpoints are prefixed with `/api/v1`.

## Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get access token |
| POST | `/auth/refresh` | Refresh access token |

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/campaigns` | Get all campaigns |
| GET | `/campaigns/{id}` | Get campaign by ID |
| POST | `/campaigns` | Create a new campaign |
| PUT | `/campaigns/{id}` | Update campaign |
| DELETE | `/campaigns/{id}` | Delete campaign |
| GET | `/campaigns/{id}/users` | Get users for campaign |
| POST | `/campaigns/{id}/users` | Add user to campaign |
| DELETE | `/campaigns/{id}/users/{userId}` | Remove user from campaign |
| PUT | `/campaigns/{id}/users/{userId}/role` | Update user role in campaign |
| GET | `/campaigns/{id}/sessions` | Get sessions for campaign |
| GET | `/campaigns/{id}/characters` | Get characters for campaign |
| GET | `/campaigns/{id}/locations` | Get locations for campaign |
| GET | `/campaigns/{id}/statistics` | Get campaign statistics |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sessions` | Get all sessions |
| GET | `/sessions/{id}` | Get session by ID |
| POST | `/sessions` | Create a new session |
| PUT | `/sessions/{id}` | Update session |
| DELETE | `/sessions/{id}` | Delete session |

### Characters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/characters` | Get all characters |
| GET | `/characters/{id}` | Get character by ID |
| POST | `/characters` | Create a new character |
| PUT | `/characters/{id}` | Update character |
| DELETE | `/characters/{id}` | Delete character |
| GET | `/characters/{id}/relationships` | Get character relationships |
| POST | `/characters/{id}/relationships` | Create character relationship |
| PUT | `/characters/{id}/relationships/{relationshipId}` | Update character relationship |
| DELETE | `/characters/{id}/relationships/{relationshipId}` | Delete character relationship |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/locations` | Get all locations |
| GET | `/locations/{id}` | Get location by ID |
| POST | `/locations` | Create a new location |
| PUT | `/locations/{id}` | Update location |
| DELETE | `/locations/{id}` | Delete location |
| GET | `/locations/{id}/children` | Get child locations |

### RPG Worlds

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rpg-worlds` | Get all RPG worlds |
| GET | `/rpg-worlds/{id}` | Get RPG world by ID |
| POST | `/rpg-worlds` | Create a new RPG world |
| PUT | `/rpg-worlds/{id}` | Update RPG world |
| DELETE | `/rpg-worlds/{id}` | Delete RPG world |
| GET | `/rpg-worlds/{id}/campaigns` | Get campaigns for RPG world |

### Relationships

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/relationships` | Get all relationships |
| GET | `/relationships/{id}` | Get relationship by ID |
| POST | `/relationships` | Create a new relationship |
| PUT | `/relationships/{id}` | Update relationship |
| DELETE | `/relationships/{id}` | Delete relationship |

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Metadata (pagination, etc.)
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": [
      // Additional error details
    ]
  }
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Permission denied |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `SERVER_ERROR` | Internal server error |

## Pagination

Endpoints that return lists of resources support pagination through query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 20)

Example:
```
GET /api/v1/campaigns?page=2&limit=10
```

The response includes pagination metadata:

```json
{
  "success": true,
  "data": [
    // List of items
  ],
  "meta": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

## Filtering and Searching

Many list endpoints support filtering and searching through query parameters:

- `search`: Search term
- Other endpoint-specific filters

Example:
```
GET /api/v1/campaigns?search=fantasy&rpg_world_id=123e4567-e89b-12d3-a456-426614174000
```

## Rate Limiting

The API implements rate limiting to prevent abuse. If you exceed the rate limit, you will receive a `429 Too Many Requests` response.

## API Versioning

The API is versioned through the URL path. The current version is `v1`.

## Interactive Documentation

Interactive API documentation is available at `/api-docs`.
