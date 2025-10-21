FROM node:20-slim

WORKDIR /app

# Install OpenSSL untuk Prisma
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install ALL dependencies (termasuk devDependencies untuk nodemon)
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy seluruh aplikasi
COPY . .

# Expose port
EXPOSE 8001

# Start aplikasi (akan di-override oleh docker-compose)
CMD ["npm", "start"]