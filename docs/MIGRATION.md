# API Migration Guide

This guide provides information about migrating between different versions of the API.

## Version 1.0.0

### Breaking Changes

1. **Authentication**
   - Changed from JWT tokens to session tokens
   - Session tokens must be included in the `Authorization` header
   - Format: `Authorization: Bearer <session_token>`

2. **Response Format**
   - Standardized response format for all endpoints
   - All responses now include a `data` field
   - Error responses include `error` and `code` fields
   - Pagination information is included in a `pagination` object

3. **Pagination**
   - Changed from `offset`/`limit` to `page`/`limit`
   - Added `total_pages` to pagination metadata
   - Default page size is now 10 items

4. **Contact Relationships**
   - Changed from `relationship` to `relationship_type`
   - Added validation for relationship types
   - Added user ownership checks

5. **Project Members**
   - Added role-based access control
   - Added user ownership checks
   - Added validation for member roles

6. **Security Events**
   - Added IP address tracking
   - Added user filtering
   - Added event type validation

### New Features

1. **API Versioning**
   - Added support for version headers
   - Added content negotiation
   - Added version deprecation notices

2. **Rate Limiting**
   - Added per-IP rate limiting
   - Added rate limit headers
   - Added retry-after information

3. **Error Handling**
   - Added standardized error format
   - Added error codes
   - Added detailed error messages

4. **Pagination**
   - Added sorting options
   - Added filtering options
   - Added total count information

5. **Security**
   - Added IP address tracking
   - Added user activity logging
   - Added role-based access control

### Migration Steps

1. **Update Authentication**
   ```typescript
   // Old
   const response = await fetch('/api/endpoint', {
     headers: {
       'Authorization': `Bearer ${jwtToken}`
     }
   });

   // New
   const response = await fetch('/api/endpoint', {
     headers: {
       'Authorization': `Bearer ${sessionToken}`,
       'X-API-Version': '1.0.0'
     }
   });
   ```

2. **Update Response Handling**
   ```typescript
   // Old
   const { data, error } = await response.json();
   if (error) throw new Error(error.message);

   // New
   const { data, error, code } = await response.json();
   if (error) throw new ApiError(error, code);
   ```

3. **Update Pagination**
   ```typescript
   // Old
   const { data, total, offset, limit } = await response.json();
   const nextPage = offset + limit;

   // New
   const { data, pagination } = await response.json();
   const nextPage = pagination.page + 1;
   ```

4. **Update Contact Relationships**
   ```typescript
   // Old
   const relationship = {
     contactId: '123',
     relatedContactId: '456',
     relationship: 'friend'
   };

   // New
   const relationship = {
     contact_id: '123',
     related_contact_id: '456',
     relationship_type: 'friend'
   };
   ```

5. **Update Project Members**
   ```typescript
   // Old
   const member = {
     projectId: '123',
     userId: '456'
   };

   // New
   const member = {
     project_id: '123',
     user_id: '456',
     role: 'member'
   };
   ```

6. **Update Security Events**
   ```typescript
   // Old
   const event = {
     type: 'login',
     userId: '123'
   };

   // New
   const event = {
     event_type: 'login',
     details: {
       browser: 'Chrome'
     }
   };
   ```

### Deprecation Timeline

1. **Version 1.0.0**
   - Released: January 1, 2024
   - Support until: December 31, 2024
   - Deprecation notice: June 30, 2024

2. **Future Versions**
   - Version 2.0.0: Planned for January 1, 2025
   - Version 1.0.0 will be supported for 12 months after 2.0.0 release

### Support

For help with migration, please contact:
- Email: api-support@example.com
- Documentation: https://api.example.com/docs
- Status: https://status.example.com 