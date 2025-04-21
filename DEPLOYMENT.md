# Deployment Guide for RPG Archivist Web

This guide will help you deploy the RPG Archivist Web application to a production environment using Docker, Nginx, and Let's Encrypt.

## Prerequisites

- A server with Docker and Docker Compose installed
- A domain name pointing to your server
- Basic knowledge of Docker, Nginx, and SSL

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Lukan444/RPG-Archivist.git
cd RPG-Archivist
```

### 2. Configure Environment Variables

Create the necessary environment files:

```bash
cp .env.example .env
cp backend/.env.production.example backend/.env.production
```

Edit the `.env` file and set the following variables:

- `DOMAIN_NAME`: Your domain name (e.g., rpg-archivist.com)
- `NEO4J_USERNAME`: Username for Neo4j database
- `NEO4J_PASSWORD`: Password for Neo4j database
- `JWT_SECRET`: Secret key for JWT authentication
- `OPENAI_API_KEY`: Your OpenAI API key

Edit the `backend/.env.production` file and set the appropriate values.

### 3. Create Required Directories

```bash
mkdir -p nginx/certbot/conf
mkdir -p nginx/certbot/www
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
```

### 4. Initialize SSL Certificates

Edit the `init-letsencrypt.sh` script and set your email address, then make it executable and run it:

```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

This script will:
- Create a temporary self-signed certificate
- Start Nginx
- Request a real certificate from Let's Encrypt
- Reload Nginx with the new certificate

### 5. Start the Application

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 6. Verify the Deployment

Visit your domain in a web browser to verify that the application is running correctly.

## Maintenance

### Updating the Application

To update the application to the latest version:

```bash
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Renewing SSL Certificates

Certificates are automatically renewed by the Certbot container. You can manually trigger a renewal with:

```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Backing Up Neo4j Data

To back up the Neo4j database:

```bash
docker-compose -f docker-compose.prod.yml exec neo4j neo4j-admin dump --database=neo4j --to=/backups/neo4j-backup.dump
```

## Troubleshooting

### Checking Logs

To check logs for a specific service:

```bash
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

Replace `[service_name]` with one of: `frontend`, `backend`, `neo4j`, `nginx`, or `certbot`.

### Common Issues

1. **SSL Certificate Issues**: Check the Certbot logs and make sure your domain is correctly pointing to your server.

2. **Database Connection Issues**: Verify that the Neo4j credentials are correct in both `.env` and `backend/.env.production`.

3. **API Connection Issues**: Check that the `FRONTEND_URL` in `backend/.env.production` matches your domain name.

## Security Considerations

- The production setup uses HTTPS for all connections
- Neo4j database is not exposed to the public internet
- Nginx is configured with security headers
- Rate limiting is enabled for API endpoints
- Docker containers run with minimal privileges

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Neo4j Documentation](https://neo4j.com/docs/)
