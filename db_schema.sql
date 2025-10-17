-- ===============================
-- Database: food_track
-- ===============================

CREATE DATABASE IF NOT EXISTS food_track;
USE food_track;

-- ===============================
-- 1️⃣ Countries Table
-- ===============================
DROP TABLE IF EXISTS countries;
CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===============================
-- 2️⃣ Branches Table
-- ===============================
DROP TABLE IF EXISTS branches;
CREATE TABLE branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===============================
-- 3️⃣ Branch Locations Table
-- ===============================
DROP TABLE IF EXISTS branch_locations;
CREATE TABLE branch_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  country_id INT NOT NULL,
  UNIQUE KEY unique_branch_country (branch_id, country_id),
  FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE CASCADE,
  FOREIGN KEY (country_id) REFERENCES countries (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===============================
-- 4️⃣ Food Entries Table
-- ===============================
DROP TABLE IF EXISTS food_entries;
CREATE TABLE food_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  food_name VARCHAR(255) NOT NULL,
  serving_size VARCHAR(50) DEFAULT NULL,
  carbs DECIMAL(5,2) NOT NULL,
  protein DECIMAL(5,2) NOT NULL,
  fat DECIMAL(5,2) NOT NULL,
  saturated_fat DECIMAL(5,2) DEFAULT NULL,
  sugar DECIMAL(5,2) DEFAULT NULL,
  fiber DECIMAL(5,2) DEFAULT NULL,
  cholesterol INT DEFAULT NULL,
  sodium INT DEFAULT NULL,
  calories DECIMAL(6,2) GENERATED ALWAYS AS (carbs * 4 + protein * 4 + fat * 9) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===============================
-- 5️⃣ Food Items Table
-- ===============================
DROP TABLE IF EXISTS food_items;
CREATE TABLE food_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_location_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  serving_size VARCHAR(50) DEFAULT NULL,
  calories INT DEFAULT NULL,
  total_fat FLOAT DEFAULT NULL,
  saturated_fat FLOAT DEFAULT NULL,
  trans_fat FLOAT DEFAULT NULL,
  cholesterol INT DEFAULT NULL,
  sodium INT DEFAULT NULL,
  carbohydrates FLOAT DEFAULT NULL,
  sugars FLOAT DEFAULT NULL,
  protein FLOAT DEFAULT NULL,
  FOREIGN KEY (branch_location_id) REFERENCES branch_locations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
