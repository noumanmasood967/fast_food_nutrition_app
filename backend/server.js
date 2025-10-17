// === IMPORT DEPENDENCIES ===
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";

// === LOAD ENVIRONMENT VARIABLES ===
dotenv.config();

// === HANDLE __dirname IN ES MODULES ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === INITIALIZE EXPRESS APP ===
const app = express();

// === APPLY CORS FIRST (IMPORTANT) ===
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// === OTHER MIDDLEWARE ===
app.use(bodyParser.json());
// ------------------------------------------------------------------
// --- CRITICAL CORRECTION 1: Serve files from the 'frontend' folder
// path.join(__dirname, '..', 'frontend') goes from /backend to /frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));
// ------------------------------------------------------------------


// === DATABASE CONFIGURATION ===
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// === TEST DATABASE CONNECTION ===
const testConnection = async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Connected to MySQL!");
    conn.release();
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
    process.exit(1);
  }
};

// === UTILITY FUNCTION ===
const handleDatabaseError = (res, err, operation) => {
  console.error(`❌ ${operation} error:`, err);
  res.status(500).json({ error: "Database error" });
};

// === ROUTES ===

// ------------------------------------------------------------------
// --- CRITICAL CORRECTION 2: Add Root Route to serve main HTML file
// This fixes the "Cannot GET /" error

// ------------------------------------------------------------------


// ✅ Countries
app.get("/countries", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM countries");
    res.json(rows);
  } catch (err) {
    handleDatabaseError(res, err, "Fetch countries");
  }
});

// ✅ Branches
app.get("/branches", async (req, res) => {
  const countryId = req.query.country_id;
  if (!countryId) return res.status(400).json({ error: "country_id is required" });

  try {
    const [rows] = await db.query(
      `SELECT b.id, b.name 
        FROM branches b
        JOIN branch_locations bl ON bl.branch_id = b.id
        WHERE bl.country_id = ?`,
      [countryId]
    );
    res.json(rows);
  } catch (err) {
    handleDatabaseError(res, err, "Fetch branches");
  }
});

// ✅ Food Items
app.get("/items", async (req, res) => {
  const { country_id, branch_id } = req.query;
  if (!country_id || !branch_id)
    return res.status(400).json({ error: "country_id and branch_id are required" });

  try {
    const [rows] = await db.query(
      `SELECT fi.id, fi.name, fi.serving_size, fi.calories, fi.total_fat, fi.saturated_fat,
             fi.trans_fat, fi.cholesterol, fi.sodium, fi.carbohydrates, fi.sugars, fi.protein
        FROM food_items fi
        JOIN branch_locations bl ON fi.branch_location_id = bl.id
        WHERE bl.country_id = ? AND bl.branch_id = ?`,
      [country_id, branch_id]
    );
    res.json(rows);
  } catch (err) {
    handleDatabaseError(res, err, "Fetch food items");
  }
});

// ✅ Single Food Item
app.get("/item", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const [rows] = await db.query("SELECT * FROM food_items WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    handleDatabaseError(res, err, "Fetch item");
  }
});

// ✅ Add Food Item
app.post("/items", async (req, res) => {
  const data = req.body;
  const sql = `
    INSERT INTO food_items (
      branch_location_id, name, serving_size, calories, total_fat, saturated_fat, 
      trans_fat, cholesterol, sodium, carbohydrates, sugars, protein
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    data.branch_location_id, data.name, data.serving_size, data.calories,
    data.total_fat, data.saturated_fat, data.trans_fat,
    data.cholesterol, data.sodium, data.carbohydrates, data.sugars, data.protein,
  ];

  try {
    const [result] = await db.query(sql, values);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    handleDatabaseError(res, err, "Insert food item");
  }
});

// ✅ Delete Food Item
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM food_items WHERE id = ?", [id]);
    res.sendStatus(204);
  } catch (err) {
    handleDatabaseError(res, err, "Delete food item");
  }
});

// === START SERVER ===
const PORT = process.env.PORT || 3000;
// Set HOST to 0.0.0.0 to listen on all public interfaces
const HOST = '0.0.0.0'; 

const startServer = async () => {
  await testConnection();
  // Pass both PORT and HOST to app.listen()
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  });
};

startServer()