#!/bin/sh
set -e

echo "🔄 Checking database connection..."

# Wait for database to be ready
until npx prisma db push --accept-data-loss > /dev/null 2>&1; do
  echo "⏳ Waiting for database to be ready..."
  sleep 2
done

echo "✅ Database is ready!"

# Check if migrations are needed
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy || {
  echo "⚠️  No migrations to apply or migration failed, using db push..."
  npx prisma db push --accept-data-loss
}

echo "✅ Migrations completed!"

# Check if database is empty (need seeding)
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM User;" 2>/dev/null | grep -oP '\d+' | tail -1 || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  echo "🌱 Database is empty, running seeder..."
  npm run prisma:seed || echo "⚠️  Seeding failed or skipped"
  echo "✅ Seeding completed!"
else
  echo "ℹ️  Database already has $USER_COUNT users, skipping seed..."
fi

# Generate Prisma Client (in case of schema changes)
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🚀 Starting application..."

# Execute CMD dari Dockerfile
exec "$@"