-- Run as the postgres superuser:
--   psql -U postgres -f backend/scripts/setup-db.sql
--
-- Idempotent: drops existing role/db before recreating.
DROP DATABASE IF EXISTS ecommerce;
DROP USER IF EXISTS ecommerce;
CREATE USER ecommerce WITH PASSWORD 'ecommerce';
CREATE DATABASE ecommerce OWNER ecommerce;
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce;
