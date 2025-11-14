# PT Solusi Bangunan Berkah - Microservices Backend

Proyek berbasis Node.js dengan arsitektur microservices untuk optimasi scalability dan maintainability.

# Setup dan Jalankan

1. Pastikan Docker dan Docker Compose sudah terinstal.
2. Jalankan perintah berikut untuk membangun dan menjalankan semua layanan:

```
docker-compose up --build
```

3. Akses layanan melalui port yang telah ditentukan di `docker-compose.yml`.

# Layanan

- Auth Service: Manajemen autentikasi dan otorisasi pengguna.
- Product Service: Manajemen data produk.
- Order Service: Manajemen pesanan pelanggan.
- Review Service: Manajemen ulasan produk.

# Struktur Proyek

- `services/`: Direktori utama untuk semua layanan microservices.
  - `auth-service/`: Layanan autentikasi.
  - `product-service/`: Layanan produk.
  - `order-service/`: Layanan pesanan.
  - `review-service/`: Layanan ulasan.
- `docker-compose.yml`: Konfigurasi Docker Compose untuk mengatur layanan.

# Kontribusi

Kontribusi sangat diterima! Silakan buat pull request atau laporkan isu di repository ini

docker-compose down // Stop and remove containers
docker volume rm pt-solusi-bangunan-berkah_mysql_data // Hapus volume database untuk reset data
docker-compose build --no-cache // Rebuild services without cache
docker-compose up -d --force-recreate // Restart services with fresh build

<!-- jika ada perubahaan coding rebuild docker tanpa remove container -->

docker-compose up -d --build // Rebuild and restart services

# 1. Rebuild dan restart product-service

docker-compose up -d --build product-service

# 2. Start semua services

docker-compose up -d

# 3. Cek logs

docker logs product-service --tail 50

# 4. Jalankan migration manual (jika perlu)

docker exec -it product-service npx prisma migrate dev --name init

# 5. Test endpoints (gunakan commands di atas)
