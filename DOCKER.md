# 🐳 Docker Commands - PT Solusi Bangunan Berkah

<div align="center">

![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-13AA52?style=for-the-badge&logo=mongodb)
![Node.js](https://img.shields.io/badge/Node.js-v20-339933?style=for-the-badge&logo=node.js)

**Panduan Lengkap Docker & Docker Compose Commands untuk Microservices**

</div>

---

## 📑 Daftar Isi

- [🚀 Quick Start](#-quick-start)
- [🔄 Lifecycle Management](#-lifecycle-management)
- [📊 Monitoring & Debugging](#-monitoring--debugging)
- [🔧 Service-Specific Commands](#-service-specific-commands)
- [💾 Database Operations](#-database-operations)
- [🔨 Build & Rebuild](#-build--rebuild)
- [📋 Useful Aliases & Tips](#-useful-aliases--tips)

---

## 🚀 Quick Start

### Startup (First Time)

```bash
# Clone, navigate, then run:
docker-compose up --build -d
```

Ini akan:

- ✅ Build semua service images
- ✅ Create containers untuk semua services
- ✅ Start services di background mode (-d)
- ✅ Mount volumes untuk data persistence

### Start (Existing Containers)

```bash
docker-compose up -d
```

Gunakan ini jika containers sudah ada, hanya start ulang.

### Full Reset

```bash
docker-compose down -v
docker-compose up --build -d
```

Ini akan **menghapus semua data**. Hanya gunakan untuk development reset!

---

## 🔄 Lifecycle Management

### ✅ Start Services

```bash
# Start semua services
docker-compose up -d

# Start specific service
docker-compose up -d auth-service
docker-compose up -d product-service
```

### ⏸️ Stop Services

```bash
# Stop semua (data tetap tersimpan)
docker-compose stop

# Stop specific service
docker-compose stop auth-service product-service
```

### 🔁 Restart Services

```bash
# Restart semua
docker-compose restart

# Restart specific
docker-compose restart auth-service
```

### ❌ Stop & Remove (Keep Volumes)

```bash
# Baik untuk cleanup tanpa reset data
docker-compose down
```

### 🗑️ Full Cleanup (Remove Everything)

```bash
# HATI-HATI: Menghapus semua containers, networks, dan volumes
docker-compose down -v

# Option breakdown:
# -v    = Remove named volumes
# --rmi = Remove images (all/local)
# -s    = Remove stopped containers
```

---

## 📊 Monitoring & Debugging

### 📋 Status & Health

```bash
# Lihat semua containers dan statusnya
docker-compose ps

# Output:
# NAME                    COMMAND             STATUS         PORTS
# auth-service            docker-entrypoint   Up 2 minutes   0.0.0.0:8001->8001/tcp
# product-service         docker-entrypoint   Up 2 minutes   0.0.0.0:8002->8002/tcp
# mongodb                 mongod              Up 2 minutes   27017/tcp
```

### 📜 View Logs

```bash
# Real-time logs dari semua services
docker-compose logs -f

# Logs dari specific service
docker-compose logs -f auth-service
docker-compose logs -f product-service
docker-compose logs -f mongodb

# Last 50 lines (non-follow mode)
docker-compose logs --tail 50

# Logs dengan timestamps
docker-compose logs -f --timestamps

# Logs dari multiple services
docker-compose logs -f auth-service product-service
```

### 🔍 Enter Container Shell

```bash
# Interactive shell di service
docker-compose exec auth-service sh
docker-compose exec product-service sh
docker-compose exec mongodb mongosh

# Exit: type 'exit' atau Ctrl+D
```

### 📊 View Resource Usage

```bash
# CPU, Memory, Network I/O
docker stats

# Specific service
docker stats auth-service product-service
```

### 🌐 Test Connectivity

```bash
# Test dari container ke service
docker-compose exec auth-service wget -O - http://product-service:8002/health

# Test dari host ke container
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:27017  # MongoDB
```

---

## 🔧 Service-Specific Commands

### 🔐 Auth Service

```bash
# View logs
docker-compose logs -f auth-service

# Enter shell
docker-compose exec auth-service sh

# Restart dengan rebuild
docker-compose up -d --build auth-service

# Run seed data
docker-compose exec auth-service npm run prisma:seed
docker-compose exec auth-service npm run userSeeder
```

### 📦 Product Service

```bash
# View logs
docker-compose logs -f product-service

# Check uploads directory
docker-compose exec product-service ls -la uploads/

# Run seeding
docker-compose exec product-service npm run prisma:seed

# Test API
docker-compose exec product-service wget -O - http://localhost:8002/health
```

### 🏗️ Project Service

```bash
docker-compose logs -f project-service
docker-compose exec project-service sh
docker-compose up -d --build project-service
docker-compose exec project-service npm run prisma:seed
```

### ⭐ Review Service

```bash
docker-compose logs -f review-service
docker-compose exec review-service sh
docker-compose up -d --build review-service
```

### 💬 Chat Service

```bash
docker-compose logs -f chat-service
docker-compose exec chat-service sh
docker-compose up -d --build chat-service
```

### 💾 MongoDB

```bash
# View logs
docker-compose logs -f mongodb

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Backup database
docker-compose exec mongodb mongodump --out=/backup

# Restore database
docker-compose exec mongodb mongorestore /backup
```

---

## 💾 Database Operations

### 🗄️ MongoDB Management

```bash
# Connect ke MongoDB shell
docker-compose exec mongodb mongosh

# List databases
show dbs

# Use database
use bangunan_berkah

# List collections
show collections

# View data
db.users.find()
db.products.find()
db.projects.find()

# Exit
exit
```

### 🔄 Prisma Migrations

```bash
# Run migrations
docker-compose exec auth-service npx prisma migrate dev
docker-compose exec product-service npx prisma migrate dev

# Create new migration
docker-compose exec auth-service npx prisma migrate dev --name add_new_table

# Reset & re-seed
docker-compose exec auth-service npx prisma migrate reset

# View migrations status
docker-compose exec auth-service npx prisma migrate status
```

### 🌱 Seed Database

```bash
# Seed specific service
docker-compose exec auth-service npm run prisma:seed
docker-compose exec product-service npm run prisma:seed
docker-compose exec project-service npm run prisma:seed

# Seed all at once
docker-compose exec auth-service npm run prisma:seed && \
docker-compose exec product-service npm run prisma:seed && \
docker-compose exec project-service npm run prisma:seed
```

### 📊 Backup & Restore

```bash
# Backup seluruh database
docker-compose exec mongodb mongodump --out=/data/backups --db=bangunan_berkah

# Export ke file
docker-compose exec mongodb mongoexport --db=bangunan_berkah --collection=users --out=/data/users.json

# Import dari file
docker-compose exec mongodb mongoimport --db=bangunan_berkah --collection=users /data/users.json
```

---

## 🔨 Build & Rebuild

### 🏗️ Build Images

```bash
# Build semua services
docker-compose build

# Build specific service
docker-compose build auth-service
docker-compose build product-service

# Build tanpa cache (force rebuild)
docker-compose build --no-cache
docker-compose build --no-cache auth-service
```

### 🔄 Rebuild & Restart (Development Workflow)

```bash
# Rebuild & restart semua (if code changed)
docker-compose up -d --build

# Rebuild & restart specific service
docker-compose up -d --build auth-service

# Rebuild, force recreate, then restart
docker-compose up -d --build --force-recreate
```

### 🧹 Clean Up Unused Images

```bash
# Remove unused images
docker image prune

# Remove ALL images (even from other projects)
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (⚠️ DANGEROUS)
docker system prune -a --volumes
```

---

## 📋 Useful Aliases & Tips

### 💡 Time-Saving Aliases

Add to your `.bashrc`, `.zshrc`, or PowerShell profile:

```bash
# Bash/Zsh aliases
alias dc='docker-compose'
alias dcl='docker-compose logs -f'
alias dcs='docker-compose ps'
alias dcud='docker-compose up -d'
alias dcdown='docker-compose down'
alias dcr='docker-compose restart'

# Example usage:
# dcud                 → docker-compose up -d
# dcl auth-service     → docker-compose logs -f auth-service
# dcs                  → docker-compose ps
# dcdown               → docker-compose down
```

### 🎯 Common Development Workflows

**Scenario 1: Code Changes, Need to Restart Service**

```bash
docker-compose up -d --build auth-service
docker-compose logs -f auth-service
```

**Scenario 2: Debug Service Issues**

```bash
docker-compose ps                                    # Check status
docker-compose logs -f --tail 100 auth-service      # View recent logs
docker-compose exec auth-service sh                 # Debug inside container
```

**Scenario 3: Full Reset (Nuke Everything)**

```bash
docker-compose down -v
docker system prune -a --volumes  # Optional: free up space
docker-compose up --build -d
```

**Scenario 4: Seed Data After Database Reset**

```bash
docker-compose down -v
docker-compose up -d
sleep 5  # Wait for MongoDB to start
docker-compose exec auth-service npm run prisma:seed
docker-compose exec product-service npm run prisma:seed
```

### ⚡ Performance Tips

```bash
# 1. Use --build flag hanya saat ada dependency changes
# ✅ GOOD: docker-compose up -d
# ❌ BAD:  docker-compose up -d --build (setiap kali)

# 2. Check resource usage
docker stats

# 3. Limit resources di docker-compose.yml
# services:
#   auth-service:
#     deploy:
#       resources:
#         limits:
#           cpus: '0.5'
#           memory: 512M

# 4. Use .dockerignore like .gitignore
# Exclude: node_modules, .git, .env, etc

# 5. Consider using BuildKit
DOCKER_BUILDKIT=1 docker-compose build
```

### 🔐 Security Best Practices

```bash
# ❌ JANGAN expose sensitive data di logs
docker-compose logs  # Hati-hati dengan JWT, passwords!

# ✅ DO: Gunakan .env untuk secrets
# .env
JWT_SECRET=xxxxx
MONGO_PASSWORD=xxxxx

# ❌ JANGAN: Hardcoded di docker-compose.yml
# ✅ DO: Reference dari .env atau external secrets

# Scan images for vulnerabilities
docker scan auth-service
```

---

## 📞 Troubleshooting

| Issue                         | Solution                                                            |
| :---------------------------- | :------------------------------------------------------------------ |
| **Port already in use**       | `docker-compose down && docker-compose up -d`                       |
| **Container won't start**     | `docker-compose logs -f {service}` untuk lihat error                |
| **MongoDB connection failed** | `docker-compose restart mongodb && sleep 3 && docker-compose up -d` |
| **Prisma migration failed**   | `docker-compose exec {service} npx prisma migrate reset`            |
| **Out of disk space**         | `docker system prune -a --volumes`                                  |
| **Permission denied**         | Use `sudo docker-compose ...` atau add user to docker group         |

---

**Last Updated:** March 25, 2026  
**Docker Compose Version:** 2.0+  
**Status:** ✅ Complete Reference Guide
