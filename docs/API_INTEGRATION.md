# API Integration Guide

## Getting Started

### Base URL
```
Production: https://api.example.com/v1
Staging: https://api-staging.example.com/v1
```

### Authentication

#### API Key Authentication
1. Obtain API key from dashboard
2. Include in request headers:
```http
Authorization: Bearer YOUR_API_KEY
```

#### OAuth 2.0 Authentication
1. Register application
2. Implement OAuth flow:
```http
POST /oauth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}
```

### Rate Limiting
- 100 requests per minute
- Rate limit headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## API Endpoints

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

### Users

#### Get User Profile
```http
GET /users/me
Authorization: Bearer YOUR_TOKEN
```

#### Update User Profile
```http
PATCH /users/me
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Contacts

#### List Contacts
```http
GET /contacts
Authorization: Bearer YOUR_TOKEN
Query Parameters:
  - page: number
  - limit: number
  - search: string
  - sort: string
```

#### Create Contact
```http
POST /contacts
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "company": "Acme Inc"
}
```

#### Update Contact
```http
PATCH /contacts/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com"
}
```

#### Delete Contact
```http
DELETE /contacts/{id}
Authorization: Bearer YOUR_TOKEN
```

### Projects

#### List Projects
```http
GET /projects
Authorization: Bearer YOUR_TOKEN
Query Parameters:
  - page: number
  - limit: number
  - status: string
  - sort: string
```

#### Create Project
```http
POST /projects
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Project X",
  "description": "Project description",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

#### Update Project
```http
PATCH /projects/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Project X",
  "status": "in_progress"
}
```

#### Delete Project
```http
DELETE /projects/{id}
Authorization: Bearer YOUR_TOKEN
```

### Tasks

#### List Tasks
```http
GET /tasks
Authorization: Bearer YOUR_TOKEN
Query Parameters:
  - page: number
  - limit: number
  - status: string
  - priority: string
  - sort: string
```

#### Create Task
```http
POST /tasks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Task 1",
  "description": "Task description",
  "due_date": "2024-01-31",
  "priority": "high",
  "project_id": "project_id"
}
```

#### Update Task
```http
PATCH /tasks/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Task 1",
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /tasks/{id}
Authorization: Bearer YOUR_TOKEN
```

## Webhooks

### Configuration
1. Register webhook URL in dashboard
2. Configure events to subscribe to
3. Verify webhook signature

### Available Events
- `contact.created`
- `contact.updated`
- `contact.deleted`
- `project.created`
- `project.updated`
- `project.deleted`
- `task.created`
- `task.updated`
- `task.deleted`

### Webhook Payload
```json
{
  "event": "contact.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "contact_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Security
- Webhook signatures
- IP whitelisting
- Retry mechanism
- Error handling

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {
      "field": "error details"
    }
  }
}
```

### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

### Error Handling Best Practices
1. Check status codes
2. Parse error responses
3. Implement retry logic
4. Log errors
5. Handle rate limits

## Best Practices

### Authentication
- Store tokens securely
- Implement token refresh
- Handle token expiration
- Use HTTPS

### Rate Limiting
- Implement exponential backoff
- Cache responses
- Batch requests
- Monitor usage

### Error Handling
- Validate responses
- Handle timeouts
- Implement retries
- Log errors

### Security
- Use HTTPS
- Validate input
- Sanitize output
- Implement CORS

### Performance
- Cache responses
- Compress data
- Batch requests
- Use pagination

## SDKs

### JavaScript/TypeScript
```javascript
import { Client } from '@example/sdk';

const client = new Client({
  apiKey: 'YOUR_API_KEY'
});

// List contacts
const contacts = await client.contacts.list();

// Create contact
const contact = await client.contacts.create({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Python
```python
from example_sdk import Client

client = Client(api_key='YOUR_API_KEY')

# List contacts
contacts = client.contacts.list()

# Create contact
contact = client.contacts.create(
    name='John Doe',
    email='john@example.com'
)
```

### Ruby
```ruby
require 'example_sdk'

client = ExampleSDK::Client.new(api_key: 'YOUR_API_KEY')

# List contacts
contacts = client.contacts.list

# Create contact
contact = client.contacts.create(
    name: 'John Doe',
    email: 'john@example.com'
)
```

## Examples

### Authentication Flow
```javascript
// Login
const response = await fetch('https://api.example.com/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { access_token, refresh_token } = await response.json();

// Use access token
const contacts = await fetch('https://api.example.com/v1/contacts', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

// Refresh token
const refresh = await fetch('https://api.example.com/v1/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refresh_token
  })
});
```

### Webhook Implementation
```javascript
const express = require('express');
const app = express();

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;

  // Verify signature
  if (!verifySignature(signature, payload)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Handle event
  switch (payload.event) {
    case 'contact.created':
      handleContactCreated(payload.data);
      break;
    case 'contact.updated':
      handleContactUpdated(payload.data);
      break;
    // ...
  }

  res.status(200).json({ received: true });
});
```

## Support

### Getting Help
- API Documentation: https://docs.example.com
- Support Email: api-support@example.com
- Status Page: https://status.example.com

### Reporting Issues
1. Check documentation
2. Search known issues
3. Create support ticket
4. Provide details:
   - Request/response
   - Error messages
   - Steps to reproduce
   - Environment details 