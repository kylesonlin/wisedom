# API Documentation

## Authentication

All API requests require authentication using Supabase JWT tokens.

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `Retry-After`

## Error Handling

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}
```

Common error codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Endpoints

### Authentication

#### Sign In
```typescript
POST /api/auth/signin
Body: {
  email: string;
  password: string;
}
Response: {
  user: User;
  session: Session;
}
```

#### Sign Out
```typescript
POST /api/auth/signout
Response: {
  success: boolean;
}
```

### Projects

#### List Projects
```typescript
GET /api/projects
Query: {
  page?: number;
  limit?: number;
  status?: 'active' | 'archived';
}
Response: {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
}
```

#### Create Project
```typescript
POST /api/projects
Body: {
  name: string;
  description?: string;
  status: 'active' | 'archived';
}
Response: {
  project: Project;
}
```

### Contacts

#### List Contacts
```typescript
GET /api/contacts
Query: {
  page?: number;
  limit?: number;
  search?: string;
}
Response: {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
}
```

#### Create Contact
```typescript
POST /api/contacts
Body: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}
Response: {
  contact: Contact;
}
```

## Webhooks

### Project Updates
```typescript
POST /api/webhooks/project-updates
Headers: {
  'X-Webhook-Signature': string;
}
Body: {
  event: 'created' | 'updated' | 'deleted';
  project: Project;
}
```

### Contact Updates
```typescript
POST /api/webhooks/contact-updates
Headers: {
  'X-Webhook-Signature': string;
}
Body: {
  event: 'created' | 'updated' | 'deleted';
  contact: Contact;
}
```

## Security

### Headers
- `Content-Security-Policy`: Restricts resource loading
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts browser features

### CORS
- Allowed Origins: Configured via `NEXT_PUBLIC_ALLOWED_ORIGINS`
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization 