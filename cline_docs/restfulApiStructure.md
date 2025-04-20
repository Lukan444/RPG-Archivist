# RESTful API Structure Design

## 1. API Design Principles

The API is designed following these principles:

1. **Resource-Oriented**: Organized around resources (entities)
2. **Hierarchical**: Reflects the natural hierarchy of RPG entities (RPGWorld > Campaign > Session)
3. **Consistent Naming**: Uses consistent naming conventions for all endpoints
4. **Proper HTTP Methods**: Uses appropriate HTTP methods (GET, POST, PUT, DELETE)
5. **Stateless**: Maintains statelessness in all API interactions
6. **Secure**: Implements proper authentication and authorization
7. **Versioned**: Includes API versioning for future compatibility
8. **Paginated**: Supports pagination for list endpoints
9. **Filterable**: Allows filtering of resources by relevant criteria
10. **Documented**: Provides comprehensive documentation with Swagger/OpenAPI


## 2. API Base URL and Versioning

``n/api/v1/
``n
## 3. Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Authenticate a user |
| POST | /auth/refresh-token | Refresh an access token |
| POST | /auth/request-password-reset | Request a password reset |
| POST | /auth/reset-password | Reset a password with a token |
| GET | /auth/verify-email/:token | Verify a user's email address |


## 4. User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/profile | Get the current user's profile |
| PUT | /users/profile | Update the current user's profile |
| GET | /users/:id | Get a user by ID (admin only) |
| PUT | /users/:id | Update a user (admin only) |
| DELETE | /users/:id | Delete a user (admin only) |
| GET | /users | Get all users (admin only) |
| PUT | /users/preferences | Update user preferences |
| GET | /users/campaigns | Get campaigns for the current user |


## 5. RPG World Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /rpg-worlds | Get all RPG worlds |
| POST | /rpg-worlds | Create a new RPG world |
| GET | /rpg-worlds/:id | Get an RPG world by ID |
| PUT | /rpg-worlds/:id | Update an RPG world |
| DELETE | /rpg-worlds/:id | Delete an RPG world |
| GET | /rpg-worlds/:id/campaigns | Get campaigns for an RPG world |


## 19. Query Parameters

All list endpoints will support the following query parameters:

- page: Page number (default: 1)
- limit: Number of items per page (default: 20, max: 100)
- sort: Field to sort by (default: created_at)
- order: Sort order (asc or desc, default: desc)
- ilter: JSON object with filter criteria
- include: Related entities to include in the response
- ields: Fields to include in the response (for partial responses)
- search: Search term for text search
