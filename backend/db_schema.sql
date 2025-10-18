-- This script is for PostgreSQL, as used on Heroku.
-- Database creation and connection commands must be run outside this script or via \c command in psql.

-- ===============================
-- 1️⃣ Countries Table
-- ===============================
DROP TABLE IF EXISTS countries CASCADE;
CREATE TABLE countries (
  -- SERIAL is the correct PostgreSQL auto-increment type
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- ===============================
-- 2️⃣ Branches Table
-- ===============================
DROP TABLE IF EXISTS branches CASCADE;
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- ===============================
-- 3️⃣ Branch Locations Table
-- ===============================
DROP TABLE IF EXISTS branch_locations CASCADE;
CREATE TABLE branch_locations (
  id SERIAL PRIMARY KEY,
  branch_id INT NOT NULL,
  country_id INT NOT NULL,

  -- Correction: PostgreSQL uses 'UNIQUE' instead of 'UNIQUE KEY'
  CONSTRAINT unique_branch_country UNIQUE (branch_id, country_id),

  FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE CASCADE,
  FOREIGN KEY (country_id) REFERENCES countries (id) ON DELETE CASCADE
);

-- ===============================
-- 4️⃣ Food Entries Table
-- ===============================


-- ===============================
-- 5️⃣ Food Items Table
-- ===============================
DROP TABLE IF EXISTS food_items CASCADE;
CREATE TABLE food_items (
  id SERIAL PRIMARY KEY,
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
);