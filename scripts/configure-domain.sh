#!/bin/bash

# Configuration
DOMAIN="your-domain.com"
EMAIL="admin@your-domain.com"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if domain is provided
if [ -z "$DOMAIN" ]; then
    log_message "ERROR: Domain name is required"
    exit 1
fi

# Create required directories
mkdir -p ./ssl/live/$DOMAIN
mkdir -p ./logs/nginx

# Update Nginx configuration
log_message "Updating Nginx configuration..."
sed -i "s/your-domain.com/$DOMAIN/g" nginx.conf

# Initial SSL certificate request
log_message "Requesting initial SSL certificate..."
docker-compose -f docker-compose.prod.yml stop nginx
certbot certonly --standalone \
    --preferred-challenges http \
    --agree-tos \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN

# Copy certificates to the correct location
log_message "Copying SSL certificates..."
cp -r /etc/letsencrypt/live/$DOMAIN/* ./ssl/live/$DOMAIN/

# Set up cron job for certificate renewal
log_message "Setting up certificate renewal cron job..."
(crontab -l 2>/dev/null; echo "0 0 * * * $(pwd)/scripts/renew-ssl.sh") | crontab -

# Set up cron job for backups
log_message "Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 1 * * * $(pwd)/scripts/backup.sh") | crontab -

# Create DNS configuration guide
log_message "Creating DNS configuration guide..."
cat > dns-config.txt << EOF
DNS Configuration Guide for $DOMAIN

1. A Records:
   - $DOMAIN -> Your server IP
   - www.$DOMAIN -> Your server IP

2. CNAME Records (Optional):
   - api.$DOMAIN -> $DOMAIN
   - app.$DOMAIN -> $DOMAIN

3. MX Records (if needed):
   - $DOMAIN -> mail.$DOMAIN
   - Priority: 10

4. TXT Records:
   - SPF: v=spf1 ip4:Your_Server_IP ~all
   - DKIM: (Add your DKIM record)
   - DMARC: v=DMARC1; p=reject; rua=mailto:$EMAIL

5. Security Records:
   - CAA: 0 issue "letsencrypt.org"
   - CAA: 0 issue "comodoca.com"

Note: Replace 'Your_Server_IP' with your actual server IP address.
EOF

log_message "Domain configuration completed. Please check dns-config.txt for DNS setup instructions." 