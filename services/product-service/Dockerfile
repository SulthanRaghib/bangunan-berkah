FROM node:20-slim

WORKDIR /app

# Install OS deps required by Prisma
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (install all to allow dev tools if needed)
RUN npm install --production=false && npm prune --production

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate || true

# Copy aplikasi
COPY . .

# Copy entrypoint and make executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 8002

# Use entrypoint to run migrations then start app
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]