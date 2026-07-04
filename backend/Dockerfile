# Use the official PHP 8.4 Apache image as base
FROM php:8.4-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions required by Laravel
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip opcache

# Enable Apache mod_rewrite for clean Laravel routing
RUN a2enmod rewrite

# Configure Apache DocumentRoot to point to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf /etc/apache2/apache2.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Set directory index to index.php
RUN echo "DirectoryIndex index.php index.html" >> /etc/apache2/apache2.conf

# Set working directory
WORKDIR /var/www/html

# Copy Composer from the official composer image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application source code
COPY . .

# Install PHP dependencies without dev requirements and optimize autoloader
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Set permissions for storage and cache directories
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy startup entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port (Render overrides this with $PORT but good for documentation)
EXPOSE 80

# Execute entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
