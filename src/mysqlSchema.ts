export const mysqlSchemaScript = `-- ==========================================================
-- WH RM Technical External Stock Monitoring Database Schema
-- RDBMS: MySQL v8.0+ / MariaDB
-- Date: 2026-05-20
-- ==========================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS \`wh_external_monitoring\`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE \`wh_external_monitoring\`;

-- 1. Table: users (Pengguna)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL, -- Recommended: bcrypt/argon2 in production
  \`nama\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('Admin', 'Operator', 'Viewer') NOT NULL DEFAULT 'Viewer',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;

-- 2. Table: warehouses (Gudang Eksternal)
CREATE TABLE IF NOT EXISTS \`warehouses\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`pic\` VARCHAR(100) DEFAULT '-',
  \`phone\` VARCHAR(50) DEFAULT '-',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;

-- 3. Table: items (Daftar Barang Raw Material Technical)
CREATE TABLE IF NOT EXISTS \`items\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`unit\` VARCHAR(20) NOT NULL DEFAULT 'Kg',
  \`min_stock\` INT NOT NULL DEFAULT 100,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;

-- 4. Table: stock_balances (Posisi Stok per Gudang)
CREATE TABLE IF NOT EXISTS \`stock_balances\` (
  \`item_id\` VARCHAR(50) NOT NULL,
  \`warehouse_id\` VARCHAR(50) NOT NULL,
  \`qty\` INT NOT NULL DEFAULT 0,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`item_id\`, \`warehouse_id\`),
  FOREIGN KEY (\`item_id\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`warehouse_id\`) REFERENCES \`warehouses\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Table: transactions (Histori Keluar Masuk Stok)
CREATE TABLE IF NOT EXISTS \`transactions\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`item_id\` VARCHAR(50) NOT NULL,
  \`warehouse_id\` VARCHAR(50) NOT NULL,
  \`type\` ENUM('IN', 'OUT') NOT NULL,
  \`qty\` INT NOT NULL,
  \`notes\` VARCHAR(255) DEFAULT NULL,
  \`created_by\` VARCHAR(100) NOT NULL,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`item_id\`) REFERENCES \`items\`(\`id\`) ON DELETE RESTRICT,
  FOREIGN KEY (\`warehouse_id\`) REFERENCES \`warehouses\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ==========================================================
-- DATA SEED (DATA AWAL DUMMY SESUAI MATRIKS STOCK)
-- ==========================================================

-- Populate Users
INSERT INTO \`users\` (\`id\`, \`username\`, \`password_hash\`, \`nama\`, \`role\`) VALUES
('usr-1', 'admin', '$2b$10$xyz...', 'Administrator Utama', 'Admin'),
('usr-2', 'operator', '$2b$10$xyz...', 'Operator WH RM', 'Operator'),
('usr-3', 'viewer', '$2b$10$xyz...', 'Viewer / Supervisor', 'Viewer');

-- Populate Warehouses
INSERT INTO \`warehouses\` (\`id\`, \`name\`, \`address\`, \`pic\`, \`phone\`) VALUES
('WH-001', 'WH BCS Logistic', 'Jl. Raya Merak No. 12, Cilegon', 'Budi Santoso', '+62 812-3456-7890'),
('WH-002', 'WH Salira', 'Kawasan Industri Bojonegara, Serang', 'Hendra Wijaya', '+62 811-9876-5432'),
('WH-003', 'WH MJS (Teratai, Bojonefara)', 'Jl. Teratai Raya Blok B, Bojonegara', 'Agus Salim', '+62 857-1111-2222');

-- Populate Raw Material Items
INSERT INTO \`items\` (\`id\`, \`name\`, \`unit\`, \`min_stock\`) VALUES
('IT-001', 'Benzofuranol', 'Kg', 150),
('IT-002', 'OSBP', 'Kg', 150),
('IT-003', 'ODCB', 'Kg', 180),
('IT-004', 'Oipop', 'Kg', 120),
('IT-005', 'MCS', 'Kg', 150);

-- Populate Stock Balances
INSERT INTO \`stock_balances\` (\`item_id\`, \`warehouse_id\`, \`qty\`) VALUES
('IT-001', 'WH-001', 120),
('IT-001', 'WH-002', 100), -- Total: 220 Kg
('IT-002', 'WH-002', 120),
('IT-002', 'WH-003', 80),  -- Total: 200 Kg
('IT-003', 'WH-001', 100),
('IT-003', 'WH-003', 150), -- Total: 250 Kg
('IT-004', 'WH-001', 110),
('IT-004', 'WH-002', 100), -- Total: 210 Kg
('IT-005', 'WH-002', 80),
('IT-005', 'WH-003', 120); -- Total: 200 Kg

-- Populate Transaction Log History
INSERT INTO \`transactions\` (\`id\`, \`date\`, \`item_id\`, \`warehouse_id\`, \`type\`, \`qty\`, \`notes\`, \`created_by\`) VALUES
('TX-1001', '2026-05-18 08:30:00', 'IT-001', 'WH-001', 'IN', 120, 'Penerimaan barang impor baru', 'Operator WH RM'),
('TX-1002', '2026-05-18 09:15:00', 'IT-001', 'WH-002', 'IN', 100, 'Stock awal masuk', 'Operator WH RM'),
('TX-1003', '2026-05-19 10:00:00', 'IT-002', 'WH-002', 'IN', 120, 'Penerimaan dari supplier lokal', 'Operator WH RM'),
('TX-1004', '2026-05-19 11:45:00', 'IT-002', 'WH-003', 'IN', 80, 'Transfer stok dari kargo', 'Operator WH RM'),
('TX-1005', '2026-05-19 14:20:00', 'IT-003', 'WH-003', 'IN', 150, 'Stock Opname awal', 'Administrator Utama');
`;
