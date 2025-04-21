#!/bin/bash

# Deployment script for RPG Archivist Web
# This script is used to deploy the application to a production server

# Exit on error
set -e

# Configuration
APP_DIR="/opt/rpg-archivist"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${APP_DIR}/deploy_log.txt"

# Log function
log() {
  echo "$(date): $1" | tee -a ${LOG_FILE}
}

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Start deployment
log "Starting deployment..."

# Pull latest code
log "Pulling latest code from repository..."
cd ${APP_DIR}
git pull

# Backup current environment files
log "Backing up environment files..."
if [ -f "${APP_DIR}/.env" ]; then
  cp ${APP_DIR}/.env ${BACKUP_DIR}/.env.${TIMESTAMP}
fi
if [ -f "${APP_DIR}/backend/.env.production" ]; then
  cp ${APP_DIR}/backend/.env.production ${BACKUP_DIR}/backend_env_production.${TIMESTAMP}
fi

# Backup database
log "Backing up database..."
docker-compose -f ${APP_DIR}/docker-compose.prod.yml exec -T neo4j-backup /scripts/backup-neo4j.sh

# Pull latest Docker images
log "Pulling latest Docker images..."
docker-compose -f ${APP_DIR}/docker-compose.prod.yml pull

# Restart services
log "Restarting services..."
docker-compose -f ${APP_DIR}/docker-compose.prod.yml up -d

# Check if services are running
log "Checking service status..."
docker-compose -f ${APP_DIR}/docker-compose.prod.yml ps

# Clean up old Docker images
log "Cleaning up old Docker images..."
docker image prune -af --filter "until=24h"

# Deployment complete
log "Deployment completed successfully!"
