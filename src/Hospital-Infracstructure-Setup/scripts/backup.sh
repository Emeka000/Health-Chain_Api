#!/bin/bash

# Hospital PostgreSQL Backup Script
set -e

DB_HOST="postgres"
DB_NAME="hospital_db"
DB_USER="hospital_user"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hospital_db_backup_${DATE}.sql.gz"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

echo "Starting backup process at $(date)"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform encrypted backup
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} \
    --verbose --format=custom --compress=9 \
    --no-owner --no-privileges \
    | gzip > ${BACKUP_DIR}/${BACKUP_FILE}

# Verify backup
if [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    echo "Backup completed successfully: ${BACKUP_FILE}"
    echo "Backup size: $(du -h ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)"
else
    echo "Backup failed!"
    exit 1
fi

# Encrypt backup file
gpg --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
    --s2k-digest-algo SHA512 --s2k-count 65536 \
    --symmetric --output "${BACKUP_DIR}/${BACKUP_FILE}.gpg" \
    "${BACKUP_DIR}/${BACKUP_FILE}"

# Remove unencrypted backup
rm "${BACKUP_DIR}/${BACKUP_FILE}"

# Clean up old backups
find ${BACKUP_DIR} -name "hospital_db_backup_*.sql.gz.gpg" \
    -type f -mtime +${RETENTION_DAYS} -delete

echo "Backup process completed at $(date)"

# Test backup integrity
echo "Testing backup integrity..."
if gpg --quiet --batch --decrypt "${BACKUP_DIR}/${BACKUP_FILE}.gpg" > /dev/null 2>&1; then
    echo "Backup integrity test passed"
else
    echo "Backup integrity test failed!"
    exit 1
fi
