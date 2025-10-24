FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update -y && \
    apt-get install -y \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production=false && \
    npm cache clean --force

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/products && \
    chmod 755 uploads/products

# Setup entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Entrypoint & CMD
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]