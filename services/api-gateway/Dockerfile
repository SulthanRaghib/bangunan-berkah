FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Use npm install (not npm ci) to avoid strict lockfile sync requirement
RUN npm install --omit=dev --no-audit --no-fund

# Copy aplikasi
COPY . .

# Expose port (sesuaikan per service)
EXPOSE 8080

CMD ["npm", "start"]