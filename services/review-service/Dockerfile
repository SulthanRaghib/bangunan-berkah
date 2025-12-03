FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy aplikasi
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port (sesuaikan per service)
EXPOSE 8005

CMD ["npm", "start"]