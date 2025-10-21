FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy aplikasi
COPY . .

# Expose port (sesuaikan per service)
EXPOSE 8080

CMD ["npm", "start"]