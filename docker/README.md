# Docker Configuration for RPG Archivist Web

This directory contains Docker-related configuration files and utilities for the RPG Archivist Web application.

## Development Environment

To start the development environment:

```bash
docker-compose up
```

This will start the following services:
- Frontend (React) on http://localhost:3000
- Backend (Node.js/Express) on http://localhost:4000
- Neo4j Database on http://localhost:7474 (Browser UI) and bolt://localhost:7687 (Bolt protocol)

## Production Environment

To start the production environment:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

This will start the following services:
- Frontend (Nginx serving React build) on http://localhost:80
- Backend (Node.js/Express) on http://localhost:4000
- Neo4j Database on http://localhost:7474 (Browser UI) and bolt://localhost:7687 (Bolt protocol)

## Environment Variables

For production deployment, create a `.env` file in the project root with the following variables:

```
JWT_SECRET=your_jwt_secret_key_here
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Volumes

The following Docker volumes are used:
- `neo4j_data`: Stores Neo4j database data
- `neo4j_logs`: Stores Neo4j logs
- `neo4j_import`: Used for Neo4j data import
- `neo4j_plugins`: Stores Neo4j plugins

## Customization

You can customize the Docker configuration by modifying the following files:
- `docker-compose.yml`: Base configuration for all environments
- `docker-compose.override.yml`: Development-specific overrides (automatically used with `docker-compose up`)
- `docker-compose.prod.yml`: Production-specific overrides

## Troubleshooting

### Common Issues

1. **Port conflicts**: If you already have services running on ports 3000, 4000, 7474, or 7687, you'll need to modify the port mappings in the docker-compose files.

2. **Neo4j authentication**: The default Neo4j username is `neo4j` and the default password is `password`. You can change these in the docker-compose files.

3. **Volume permissions**: If you encounter permission issues with Docker volumes, you may need to adjust the permissions on the host machine.

### Logs

To view logs for a specific service:

```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs neo4j
```

Add the `-f` flag to follow the logs in real-time:

```bash
docker-compose logs -f backend
```
