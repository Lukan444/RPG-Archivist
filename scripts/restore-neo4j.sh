#!/bin/bash

# Neo4j Database Restore Script
# This script restores a Neo4j database from a backup file

# Exit on error
set -e

# Configuration
BACKUP_DIR="/backups"
LOG_FILE="${BACKUP_DIR}/restore_log.txt"

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Error: No backup file specified." | tee -a ${LOG_FILE}
  echo "Usage: $0 <backup_file>" | tee -a ${LOG_FILE}
  echo "Available backups:" | tee -a ${LOG_FILE}
  find ${BACKUP_DIR} -name "neo4j_backup_*.dump.gz" -type f | sort -r | tee -a ${LOG_FILE}
  exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file ${BACKUP_FILE} not found." | tee -a ${LOG_FILE}
  exit 1
fi

echo "$(date): Starting Neo4j restore from ${BACKUP_FILE}..." | tee -a ${LOG_FILE}

# Wait for Neo4j to be ready
echo "Checking if Neo4j is available..." | tee -a ${LOG_FILE}
until wget -q --spider http://localhost:7474 || curl -s http://localhost:7474 > /dev/null; do
  echo "Waiting for Neo4j to be ready..." | tee -a ${LOG_FILE}
  sleep 5
done

# Stop Neo4j
echo "Stopping Neo4j..." | tee -a ${LOG_FILE}
neo4j stop

# Uncompress backup if it's compressed
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  echo "Uncompressing backup file..." | tee -a ${LOG_FILE}
  UNCOMPRESSED_FILE="${BACKUP_FILE%.gz}"
  gunzip -c ${BACKUP_FILE} > ${UNCOMPRESSED_FILE}
  BACKUP_FILE=${UNCOMPRESSED_FILE}
fi

# Restore backup
echo "Restoring Neo4j database from backup..." | tee -a ${LOG_FILE}
neo4j-admin load --database=neo4j --from=${BACKUP_FILE} --force

# Start Neo4j
echo "Starting Neo4j..." | tee -a ${LOG_FILE}
neo4j start

# Check if Neo4j started successfully
if [ $? -eq 0 ]; then
  echo "$(date): Restore completed successfully." | tee -a ${LOG_FILE}
else
  echo "$(date): Restore failed! Neo4j may not have started correctly." | tee -a ${LOG_FILE}
  exit 1
fi

# Clean up uncompressed file if we created one
if [[ "${BACKUP_FILE}" != "$1" ]]; then
  echo "Cleaning up temporary files..." | tee -a ${LOG_FILE}
  rm ${BACKUP_FILE}
fi

echo "$(date): Restore process completed." | tee -a ${LOG_FILE}
