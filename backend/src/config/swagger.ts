import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RPG Archivist API',
      version,
      description: 'API documentation for the RPG Archivist Web application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'RPG Archivist Team',
        url: 'https://github.com/yourusername/rpg-archivist-web',
        email: 'your-email@example.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Development server',
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
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Validation failed',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      param: {
                        type: 'string',
                        example: 'username',
                      },
                      msg: {
                        type: 'string',
                        example: 'Username is required',
                      },
                      location: {
                        type: 'string',
                        example: 'body',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            username: {
              type: 'string',
              example: 'johndoe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'GAME_MASTER', 'PLAYER'],
              example: 'PLAYER',
            },
            created_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
            updated_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
          },
        },
        Campaign: {
          type: 'object',
          properties: {
            campaign_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'The Chronicles of Amber',
            },
            description: {
              type: 'string',
              example: 'A campaign based on Roger Zelazny\'s Amber series',
            },
            rpg_world_id: {
              type: 'string',
              format: 'uuid',
              example: '223e4567-e89b-12d3-a456-426614174000',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
            is_active: {
              type: 'boolean',
              example: true,
            },
            created_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
            updated_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
          },
        },
        Session: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            campaign_id: {
              type: 'string',
              format: 'uuid',
              example: '223e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'The Pattern of Rebma',
            },
            description: {
              type: 'string',
              example: 'The party explores the underwater city of Rebma',
            },
            number: {
              type: 'integer',
              example: 1,
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-15T18:00:00.000Z',
            },
            duration_minutes: {
              type: 'integer',
              example: 180,
            },
            is_completed: {
              type: 'boolean',
              example: true,
            },
            created_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
            updated_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
          },
        },
        Character: {
          type: 'object',
          properties: {
            character_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            campaign_id: {
              type: 'string',
              format: 'uuid',
              example: '223e4567-e89b-12d3-a456-426614174000',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              example: '323e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'Corwin of Amber',
            },
            description: {
              type: 'string',
              example: 'A prince of Amber with a sardonic wit',
            },
            is_player_character: {
              type: 'boolean',
              example: true,
            },
            character_type: {
              type: 'string',
              example: 'Prince of Amber',
            },
            created_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
            updated_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
          },
        },
        Location: {
          type: 'object',
          properties: {
            location_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            campaign_id: {
              type: 'string',
              format: 'uuid',
              example: '223e4567-e89b-12d3-a456-426614174000',
            },
            parent_location_id: {
              type: 'string',
              format: 'uuid',
              example: '323e4567-e89b-12d3-a456-426614174000',
              nullable: true,
            },
            name: {
              type: 'string',
              example: 'Amber Castle',
            },
            description: {
              type: 'string',
              example: 'The grand castle at the heart of Amber',
            },
            location_type: {
              type: 'string',
              example: 'Castle',
            },
            created_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
            updated_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
          },
        },
        RPGWorld: {
          type: 'object',
          properties: {
            rpg_world_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'Amber',
            },
            description: {
              type: 'string',
              example: 'The one true world, of which all others are but shadows',
            },
            created_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
            updated_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
          },
        },
        Relationship: {
          type: 'object',
          properties: {
            relationship_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            campaign_id: {
              type: 'string',
              format: 'uuid',
              example: '223e4567-e89b-12d3-a456-426614174000',
            },
            source_entity_id: {
              type: 'string',
              format: 'uuid',
              example: '323e4567-e89b-12d3-a456-426614174000',
            },
            source_entity_type: {
              type: 'string',
              enum: ['CHARACTER', 'LOCATION', 'EVENT', 'ITEM'],
              example: 'CHARACTER',
            },
            target_entity_id: {
              type: 'string',
              format: 'uuid',
              example: '423e4567-e89b-12d3-a456-426614174000',
            },
            target_entity_type: {
              type: 'string',
              enum: ['CHARACTER', 'LOCATION', 'EVENT', 'ITEM'],
              example: 'CHARACTER',
            },
            relationship_type: {
              type: 'string',
              example: 'SIBLING',
            },
            description: {
              type: 'string',
              example: 'Brothers with a complicated history',
            },
            created_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
            updated_at: {
              type: 'integer',
              format: 'int64',
              example: 1625097600000,
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Access token is missing or invalid',
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'User does not have permission to access this resource',
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Resource not found',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Validation failed',
                  details: [
                    {
                      param: 'username',
                      msg: 'Username is required',
                      location: 'body',
                    },
                  ],
                },
              },
            },
          },
        },
        ConflictError: {
          description: 'Resource already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'CONFLICT',
                  message: 'Resource already exists',
                },
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'SERVER_ERROR',
                  message: 'Internal server error',
                },
              },
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
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
