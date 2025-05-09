# API Documentation

## Overview

This document provides comprehensive documentation for the API endpoints. All endpoints are versioned and follow RESTful principles.

## Base URL

```
https://api.example.com/api/v1
```

## Authentication

All API endpoints require authentication using a session token. Include the session token in the request headers:

```
Authorization: Bearer <session_token>
```

## Versioning

The API uses versioning to ensure backward compatibility. You can specify the API version in two ways:

1. Using the `X-API-Version` header:
```
X-API-Version: 1.0.0
```

2. Using the `Accept` header:
```
Accept: application/vnd.example.v1.0.0+json
```

If no version is specified, the latest version will be used.

## Rate Limiting

API requests are rate-limited to prevent abuse. The current limits are:
- 100 requests per minute per IP address

Rate limit information is included in the response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `Retry-After`: Seconds to wait before making another request (when rate limit is exceeded)

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 429: Too Many Requests
- 500: Internal Server Error

## Endpoints

### Users

#### GET /users
List users with pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by (default: created_at)
- `sort_order` (optional): Sort order (asc/desc, default: desc)

Response:
```json
{
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "full_name": "User Name",
      "avatar_url": "https://example.com/avatar.jpg",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

### Contacts

#### GET /contacts
List contacts with pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by (default: created_at)
- `sort_order` (optional): Sort order (asc/desc, default: desc)

Response:
```json
{
  "data": [
    {
      "id": "contact-id",
      "user_id": "user-id",
      "name": "Contact Name",
      "email": "contact@example.com",
      "phone": "+1234567890",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

#### POST /contacts
Create a new contact.

Request Body:
```json
{
  "name": "Contact Name",
  "email": "contact@example.com",
  "phone": "+1234567890"
}
```

Response:
```json
{
  "data": {
    "id": "contact-id",
    "user_id": "user-id",
    "name": "Contact Name",
    "email": "contact@example.com",
    "phone": "+1234567890",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Contact Relationships

#### GET /contact-relationships
List contact relationships with pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by (default: created_at)
- `sort_order` (optional): Sort order (asc/desc, default: desc)

Response:
```json
{
  "data": [
    {
      "id": "relationship-id",
      "contact_id": "contact-id",
      "related_contact_id": "related-contact-id",
      "relationship_type": "friend",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

#### POST /contact-relationships
Create a new contact relationship.

Request Body:
```json
{
  "contact_id": "contact-id",
  "related_contact_id": "related-contact-id",
  "relationship_type": "friend"
}
```

Response:
```json
{
  "data": {
    "id": "relationship-id",
    "contact_id": "contact-id",
    "related_contact_id": "related-contact-id",
    "relationship_type": "friend",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Contact Interactions

#### GET /contact-interactions
List contact interactions with pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by (default: created_at)
- `sort_order` (optional): Sort order (asc/desc, default: desc)
- `contact_id` (optional): Filter by contact ID

Response:
```json
{
  "data": [
    {
      "id": "interaction-id",
      "contact_id": "contact-id",
      "interaction_type": "meeting",
      "notes": "Meeting notes",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

#### POST /contact-interactions
Create a new contact interaction.

Request Body:
```json
{
  "contact_id": "contact-id",
  "interaction_type": "meeting",
  "notes": "Meeting notes"
}
```

Response:
```json
{
  "data": {
    "id": "interaction-id",
    "contact_id": "contact-id",
    "interaction_type": "meeting",
    "notes": "Meeting notes",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Projects

#### GET /projects
List projects with pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by (default: created_at)
- `sort_order` (optional): Sort order (asc/desc, default: desc)

Response:
```json
{
  "data": [
    {
      "id": "project-id",
      "user_id": "user-id",
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

### Project Members

#### GET /project-members
List project members with pagination.

Query Parameters:
- `project_id` (required): Project ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by (default: created_at)
- `sort_order` (optional): Sort order (asc/desc, default: desc)

Response:
```json
{
  "data": [
    {
      "id": "member-id",
      "project_id": "project-id",
      "user_id": "user-id",
      "role": "member",
      "users": {
        "id": "user-id",
        "email": "user@example.com",
        "full_name": "User Name",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

#### POST /project-members
Add a new project member.

Request Body:
```json
{
  "project_id": "project-id",
  "user_id": "user-id",
  "role": "member"
}
```

Response:
```json
{
  "data": {
    "id": "member-id",
    "project_id": "project-id",
    "user_id": "user-id",
    "role": "member",
    "users": {
      "id": "user-id",
      "email": "user@example.com",
      "full_name": "User Name",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Security Events

#### GET /security-events
List security events with pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort_by` (optional): Field to sort by (default: created_at)
- `sort_order` (optional): Sort order (asc/desc, default: desc)
- `user_id` (optional): Filter by user ID

Response:
```json
{
  "data": [
    {
      "id": "event-id",
      "user_id": "user-id",
      "event_type": "login",
      "ip_address": "127.0.0.1",
      "details": {
        "browser": "Chrome"
      },
      "users": {
        "id": "user-id",
        "email": "user@example.com",
        "full_name": "User Name"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

#### POST /security-events
Create a new security event.

Request Body:
```json
{
  "event_type": "login",
  "details": {
    "browser": "Chrome"
  }
}
```

Response:
```json
{
  "data": {
    "id": "event-id",
    "user_id": "user-id",
    "event_type": "login",
    "ip_address": "127.0.0.1",
    "details": {
      "browser": "Chrome"
    },
    "users": {
      "id": "user-id",
      "email": "user@example.com",
      "full_name": "User Name"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Best Practices

1. Always include the API version in your requests
2. Handle rate limiting by checking response headers
3. Implement proper error handling
4. Use pagination for large data sets
5. Cache responses when appropriate
6. Use HTTPS for all requests
7. Keep your session token secure
8. Monitor your API usage
9. Follow the principle of least privilege
10. Report security issues immediately 