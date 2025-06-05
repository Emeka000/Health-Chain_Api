#!/bin/bash

# Hospital Redis Backup Script
set -e

REDIS_HOST="redis"
REDIS_PORT="6379"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="redis_dump_${DATE}.rdb"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

echo "Starting Redis backup process at $(date)"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Trigger Redis save
redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a ${REDIS_PASSWORD} BGSAVE

# Wait for backup to complete
while [ $(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a ${REDIS_PASSWORD} LASTSAVE) -eq $(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a ${REDIS_PASSWORD} LASTSAVE) ]; do
    sleep 1
done

# Copy dump file
docker cp hospital-redis:/data/dump.rdb ${BACKUP_DIR}/${BACKUP_FILE}

# Encrypt backup
gpg --cipher-algo AES256 --symmetric \
    --output "${BACKUP_DIR}/${BACKUP_FILE}.gpg" \
    "${BACKUP_DIR}/${BACKUP_FILE}"

# Remove unencrypted backup
rm "${BACKUP_DIR}/${BACKUP_FILE}"

# Clean up old backups
find ${BACKUP_DIR} -name "redis_dump_*.rdb.gpg" \
    -type f -mtime +${RETENTION_DAYS} -delete

echo "Redis backup completed at $(date)"
