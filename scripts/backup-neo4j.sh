#!/bin/bash

# Neo4j Database Backup Script
# This script creates a backup of the Neo4j database and manages backup retention

# Exit on error
set -e

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/neo4j_backup_${TIMESTAMP}.dump"
LOG_FILE="${BACKUP_DIR}/backup_log.txt"

# Ensure backup directory exists
mkdir -p ${BACKUP_DIR}

echo "$(date): Starting Neo4j backup..." | tee -a ${LOG_FILE}

# Wait for Neo4j to be ready
echo "Checking if Neo4j is available..." | tee -a ${LOG_FILE}
until wget -q --spider http://localhost:7474 || curl -s http://localhost:7474 > /dev/null; do
  echo "Waiting for Neo4j to be ready..." | tee -a ${LOG_FILE}
  sleep 5
done

# Create backup
echo "Creating backup of Neo4j database..." | tee -a ${LOG_FILE}
neo4j-admin dump --database=neo4j --to=${BACKUP_FILE}

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "$(date): Backup completed successfully: ${BACKUP_FILE}" | tee -a ${LOG_FILE}
  
  # Compress the backup
  echo "Compressing backup..." | tee -a ${LOG_FILE}
  gzip ${BACKUP_FILE}
  COMPRESSED_FILE="${BACKUP_FILE}.gz"
  
  # Calculate backup size
  BACKUP_SIZE=$(du -h ${COMPRESSED_FILE} | cut -f1)
  echo "Backup size: ${BACKUP_SIZE}" | tee -a ${LOG_FILE}
  
  # Remove old backups
  echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..." | tee -a ${LOG_FILE}
  find ${BACKUP_DIR} -name "neo4j_backup_*.dump.gz" -type f -mtime +${RETENTION_DAYS} -delete
  
  # List remaining backups
  BACKUP_COUNT=$(find ${BACKUP_DIR} -name "neo4j_backup_*.dump.gz" | wc -l)
  echo "Remaining backups: ${BACKUP_COUNT}" | tee -a ${LOG_FILE}
  
  echo "$(date): Backup process completed successfully." | tee -a ${LOG_FILE}
else
  echo "$(date): Backup failed!" | tee -a ${LOG_FILE}
  exit 1
fi
