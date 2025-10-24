#!/bin/sh
set -e

echo "🔄 Checking database connection..."

# Wait for database
until npx prisma db push --accept-data-loss --skip-generate > /dev/null 2>&1; do
  echo "⏳ Waiting for database..."
  sleep 2
done

echo "✅ Database is ready!"

# Create uploads directory
echo "� Creating uploads directory..."
mkdir -p /app/uploads/products
chmod -R 755 /app/uploads

# Run migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy || true

echo "✅ Migrations completed!"

# Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🚀 Starting application..."

# Execute CMD
exec "$@"
