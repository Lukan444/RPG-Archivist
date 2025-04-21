#!/bin/bash

# This script will initialize Let's Encrypt certificates for your domain
# It will create a temporary self-signed certificate first, then request a real one

# Exit on error
set -e

# Default values
domains=${DOMAIN_NAME}
rsa_key_size=4096
data_path="./nginx/certbot"
email="" # Add your email here
staging=0 # Set to 1 if you're testing your setup to avoid hitting request limits

# Check if domain is set
if [ -z "$domains" ]; then
  echo "Error: DOMAIN_NAME environment variable is not set."
  echo "Please set it in your .env file or export it before running this script."
  exit 1
fi

# Check if email is set
if [ -z "$email" ]; then
  echo "Warning: Email is not set. Let's Encrypt will not be able to send you expiry notifications."
  echo "Please edit this script and add your email address."
  read -p "Continue anyway? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit 1
  fi
fi

# Create required directories
mkdir -p "$data_path/conf/live/$domains"
mkdir -p "$data_path/www"

# Create dummy certificates
echo "Creating dummy certificate for $domains..."
openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
  -keyout "$data_path/conf/live/$domains/privkey.pem" \
  -out "$data_path/conf/live/$domains/fullchain.pem" \
  -subj "/CN=localhost"

echo "Starting nginx..."
docker-compose -f docker-compose.prod.yml up --force-recreate -d nginx

# Wait for nginx to start
echo "Waiting for nginx to start..."
sleep 5

# Request Let's Encrypt certificate
echo "Requesting Let's Encrypt certificate for $domains..."
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $email \
    --agree-tos \
    --no-eff-email \
    -d $domains \
    -d www.$domains" certbot

echo "Reloading nginx..."
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "Certificate initialization completed!"
echo "Your site should now be accessible at https://$domains"
echo "Don't forget to set up a cron job to renew your certificates."
