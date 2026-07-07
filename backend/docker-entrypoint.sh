#!/bin/sh
set -e

# Copy production environment file to .env if it exists
if [ -f "/var/www/html/.env.productions" ]; then
    echo "Copying .env.productions to .env..."
    cp /var/www/html/.env.productions /var/www/html/.env
fi

# Update Apache port to listen to Render's dynamic $PORT environment variable
if [ -n "$PORT" ]; then
    echo "Configuring Apache to listen on port $PORT"
    sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
    sed -i "s/<VirtualHost \*:80>/<VirtualHost *:$PORT>/g" /etc/apache2/sites-available/000-default.conf
fi

# Set directory permissions for Laravel storage/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generate key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating Application Key..."
    php artisan key:generate --no-interaction --force
fi

# Run package discovery
echo "Running package discovery..."
php artisan package:discover --ansi

# Run database migrations automatically
echo "Running database migrations..."
php artisan migrate:fresh --seed --force --no-interaction

# Seed database automatically if it is empty
if php artisan tinker --execute="echo \Illuminate\Support\Facades\Schema::hasTable('users') && \Illuminate\Support\Facades\DB::table('users')->count() === 0 ? 'empty' : 'not_empty';" | grep -q 'empty'; then
    echo "Database is empty. Seeding database..."
    php artisan db:seed --force --no-interaction
fi

# Optimize Laravel caching for production
echo "Caching Laravel configuration, routes, and views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Apache in the foreground
echo "Starting Apache..."
exec apache2-foreground
