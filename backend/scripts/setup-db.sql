-- Run as the postgres superuser:
--   psql -U postgres -f backend/scripts/setup-db.sql
CREATE USER ecommerce WITH PASSWORD 'ecommerce';
CREATE DATABASE ecommerce OWNER ecommerce;
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce;
