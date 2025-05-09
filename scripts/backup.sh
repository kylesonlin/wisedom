#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_DIR/backup.log"
}

# Backup PostgreSQL database
backup_database() {
    log_message "Starting database backup..."
    
    # Get database credentials from environment
    source .env.production
    
    # Create database backup
    docker-compose -f docker-compose.prod.yml exec -T db pg_dump \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -F c \
        > "$BACKUP_DIR/db_backup_$TIMESTAMP.dump"
    
    if [ $? -eq 0 ]; then
        log_message "Database backup completed successfully"
    else
        log_message "ERROR: Database backup failed"
        exit 1
    fi
}

# Backup Redis data
backup_redis() {
    log_message "Starting Redis backup..."
    
    # Create Redis backup
    docker-compose -f docker-compose.prod.yml exec -T redis redis-cli SAVE
    docker cp $(docker-compose -f docker-compose.prod.yml ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_backup_$TIMESTAMP.rdb"
    
    if [ $? -eq 0 ]; then
        log_message "Redis backup completed successfully"
    else
        log_message "ERROR: Redis backup failed"
        exit 1
    fi
}

# Backup SSL certificates
backup_ssl() {
    log_message "Starting SSL certificates backup..."
    
    # Create SSL backup
    tar -czf "$BACKUP_DIR/ssl_backup_$TIMESTAMP.tar.gz" ./ssl
    
    if [ $? -eq 0 ]; then
        log_message "SSL certificates backup completed successfully"
    else
        log_message "ERROR: SSL certificates backup failed"
        exit 1
    fi
}

# Backup environment files
backup_env() {
    log_message "Starting environment files backup..."
    
    # Create environment files backup
    tar -czf "$BACKUP_DIR/env_backup_$TIMESTAMP.tar.gz" .env.production
    
    if [ $? -eq 0 ]; then
        log_message "Environment files backup completed successfully"
    else
        log_message "ERROR: Environment files backup failed"
        exit 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log_message "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -type f -name "*.dump" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -type f -name "*.rdb" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    log_message "Cleanup completed"
}

# Main backup process
main() {
    log_message "Starting backup process..."
    
    # Create backup directory for this run
    mkdir -p "$BACKUP_DIR/$TIMESTAMP"
    
    # Run all backup functions
    backup_database
    backup_redis
    backup_ssl
    backup_env
    
    # Move all backups to timestamped directory
    mv "$BACKUP_DIR"/*_backup_* "$BACKUP_DIR/$TIMESTAMP/"
    
    # Cleanup old backups
    cleanup_old_backups
    
    log_message "Backup process completed successfully"
}

# Run main function
main 