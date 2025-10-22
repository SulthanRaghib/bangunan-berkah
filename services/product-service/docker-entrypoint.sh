#!/bin/sh
set -e

# Ensure uploads directories exist and have correct permissions
echo "🔧 Ensuring upload directories exist..."
mkdir -p /app/uploads/products
mkdir -p /app/uploads
chown -R node:node /app/uploads || true

# Run prisma migrations
echo "🔄 Running Prisma migrations..."
if [ -f prisma/schema.prisma ]; then
  npx prisma migrate deploy || true
  echo "✅ Migrations completed or no migrations to apply"
else
  echo "⚠️ Prisma schema not found, skipping migrations"
fi

# Execute the container CMD
exec "$@"
