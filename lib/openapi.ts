import { OpenAPIV3 } from 'openapi-types';

export const openApiConfig: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'RelationshipOS API',
    version: '1.0.0',
    description: 'API documentation for RelationshipOS',
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Error message',
              },
              code: {
                type: 'string',
                example: 'ERROR_CODE',
              },
              statusCode: {
                type: 'number',
                example: 400,
              },
            },
          },
        },
      },
      Contact: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          first_name: {
            type: 'string',
          },
          last_name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          phone: {
            type: 'string',
            nullable: true,
          },
          company: {
            type: 'string',
            nullable: true,
          },
          title: {
            type: 'string',
            nullable: true,
          },
          notes: {
            type: 'string',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
}; 