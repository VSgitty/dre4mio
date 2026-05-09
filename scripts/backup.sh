#!/bin/bash

# MONOPOL STUDIO - Backup Script
# Backs up database and important data

set -e

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/monopol_$BACKUP_DATE"

mkdir -p $BACKUP_DIR

echo "💾 Backing up MONOPOL database..."

# Backup PostgreSQL
if command -v pg_dump &> /dev/null; then
  pg_dump $DATABASE_URL > $BACKUP_DIR/database.sql
  echo "  ✓ Database backed up to $BACKUP_DIR/database.sql"
fi

# Backup environment
cp apps/api/.env $BACKUP_DIR/.env.api
cp apps/web/.env.local $BACKUP_DIR/.env.web
echo "  ✓ Environment files backed up"

echo "✅ Backup complete: $BACKUP_DIR"
