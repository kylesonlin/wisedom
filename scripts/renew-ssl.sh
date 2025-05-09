#!/bin/bash

# Stop nginx container
docker-compose -f docker-compose.prod.yml stop nginx

# Renew certificates
certbot renew --standalone --pre-hook "docker-compose -f docker-compose.prod.yml stop nginx" --post-hook "docker-compose -f docker-compose.prod.yml start nginx"

# Copy renewed certificates to the correct location
cp -r /etc/letsencrypt/live/your-domain.com/* ./ssl/live/your-domain.com/

# Restart nginx container
docker-compose -f docker-compose.prod.yml restart nginx

# Log renewal
echo "SSL certificates renewed at $(date)" >> ./logs/ssl-renewal.log 