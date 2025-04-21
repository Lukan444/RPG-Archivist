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

### Automated Deployment Pipeline

The application uses GitHub Actions for continuous integration and deployment (CI/CD).

#### How It Works

1. When code is pushed to the main branch, the GitHub Actions workflow is triggered
2. The workflow builds and tests the frontend and backend
3. Docker images are built and pushed to Docker Hub
4. The application is deployed to the production server
5. Slack notifications are sent to notify the team of deployment status

#### Manual Deployment

To manually deploy the application:

```bash
./scripts/deploy.sh
```

This script:
- Pulls the latest code from the repository
- Backs up environment files and the database
- Pulls the latest Docker images
- Restarts the services
- Cleans up old Docker images

#### Updating the Application

To update the application without using the automated pipeline:

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

### Database Backup System

The application includes an automated backup system for the Neo4j database. Backups are performed daily and stored in the `./backups` directory.

#### Automatic Backups

Backups are automatically created by the `neo4j-backup` service defined in the `docker-compose.prod.yml` file. The backup process:

1. Creates a dump of the Neo4j database
2. Compresses the dump file to save space
3. Maintains a retention policy (default: 7 days)
4. Logs all backup activities

#### Manual Backups

To manually trigger a backup:

```bash
docker-compose -f docker-compose.prod.yml exec neo4j-backup /scripts/backup-neo4j.sh
```

#### Restoring from Backup

To restore the database from a backup:

1. List available backups:

```bash
docker-compose -f docker-compose.prod.yml exec neo4j-backup find /backups -name "neo4j_backup_*.dump.gz" | sort -r
```

2. Restore from a specific backup:

```bash
docker-compose -f docker-compose.prod.yml exec neo4j-backup /scripts/restore-neo4j.sh /backups/neo4j_backup_YYYYMMDD_HHMMSS.dump.gz
```

#### Backup Configuration

You can modify the backup configuration by editing the `scripts/backup-neo4j.sh` file:

- `RETENTION_DAYS`: Number of days to keep backups (default: 7)
- `BACKUP_DIR`: Directory where backups are stored (default: /backups)

## Monitoring and Logging

### Monitoring System

The application includes a comprehensive monitoring system using Prometheus and Grafana.

#### Starting the Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

#### Accessing Monitoring Dashboards

- **Prometheus**: http://your-server-ip:9090
- **Grafana**: http://your-server-ip:3000 (default credentials: admin/admin)

#### Available Metrics

- Host system metrics (CPU, memory, disk, network)
- Container metrics (resource usage, health status)
- Nginx metrics (requests, status codes, response times)
- Neo4j metrics (query performance, memory usage)

### Logging System

The application uses the ELK Stack (Elasticsearch, Kibana, and Filebeat) for centralized logging.

#### Accessing Logs

- **Kibana**: http://your-server-ip:5601 (default credentials: elastic/changeme)

#### Log Sources

- Container logs from all services
- Nginx access and error logs
- Application logs from frontend and backend
- Neo4j database logs

### Direct Log Access

To check logs directly for a specific service:

```bash
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

Replace `[service_name]` with one of: `frontend`, `backend`, `neo4j`, `nginx`, or `certbot`.

### Error Reporting

The application uses Sentry for error tracking and reporting. This provides real-time error monitoring and helps identify issues in production.

#### Configuration

To enable error reporting, set the following environment variables:

- For frontend: `REACT_APP_SENTRY_DSN` in the frontend build environment
- For backend: `SENTRY_DSN` in the backend environment

#### Features

- Real-time error tracking
- Performance monitoring
- User context tracking
- Source maps for accurate stack traces
- Release tracking

#### Accessing Error Reports

Access the Sentry dashboard at https://sentry.io to view error reports, performance metrics, and user feedback.

## Troubleshooting

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
