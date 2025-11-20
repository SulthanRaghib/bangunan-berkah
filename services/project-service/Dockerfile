FROM node:20-slim

WORKDIR /app

# copy package files first for caching
COPY package*.json ./

# install dependencies (include dev for prisma generate during build)
# use `npm install` here because `npm ci` requires lockfile to match package.json
# include dev dependencies so `prisma generate` can run during image build
# ensure system libs required by Prisma (OpenSSL) are installed
# Prisma native query engine may require libssl; install openssl and libssl-dev
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends \
		ca-certificates \
		openssl \
		libssl-dev \
	&& rm -rf /var/lib/apt/lists/*

# install dependencies (include dev for prisma generate during build)
RUN npm install --include=dev --no-audit --no-fund --silent

# copy source
COPY . .

# generate Prisma client
RUN npx prisma generate || true

# ensure uploads directories exist and have proper permissions
RUN mkdir -p /app/uploads/photos /app/uploads/documents && chown -R node:node /app/uploads

EXPOSE 8004

# use non-root user where available
USER node

CMD ["npm", "start"]