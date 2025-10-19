-- Create databases untuk semua service
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS product_db;
CREATE DATABASE IF NOT EXISTS chat_db;
CREATE DATABASE IF NOT EXISTS project_db;
CREATE DATABASE IF NOT EXISTS review_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON auth_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON product_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON chat_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON project_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON review_db.* TO 'root'@'%';

FLUSH PRIVILEGES;