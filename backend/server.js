// === IMPORT DEPENDENCIES ===
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import pg from "pg"; 
import { fileURLToPath } from "url";

// === LOAD ENVIRONMENT VARIABLES ===
dotenv.config();

// === HANDLE __dirname IN ES MODULES ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === INITIALIZE EXPRESS APP ===
const app = express();

// === APPLY CORS FIRST (IMPORTANT) ===
app.use(cors());

// === OTHER MIDDLEWARE ===
app.use(bodyParser.json());

// === DATABASE CONFIGURATION ===
// CRITICAL FIX: Added SSL configuration for Heroku/Render PostgreSQL connections.
const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
        rejectUnauthorized: false 
    } 
});

// === TEST DATABASE CONNECTION ===
const testConnection = async () => {
    try {
        const client = await db.connect(); 
        console.log("✅ Connected to PostgreSQL!");
        client.release();
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

// === ROUTES (API Routes First) ===

// ✅ Countries
app.get("/api/countries", async (req, res) => {
    try {
        const result = await db.query("SELECT id, name FROM countries");
        res.json(result.rows);
    } catch (err) {
        handleDatabaseError(res, err, "Fetch countries");
    }
});

// ✅ Branches
app.get("/api/branches", async (req, res) => {
    const countryId = req.query.country_id;
    if (!countryId) return res.status(400).json({ error: "country_id is required" });
    try {
        const result = await db.query(
          `SELECT b.id, b.name 
            FROM branches b
            JOIN branch_locations bl ON bl.branch_id = b.id
            WHERE bl.country_id = $1`,
          [countryId]
        );
        res.json(result.rows);
    } catch (err) {
        handleDatabaseError(res, err, "Fetch branches");
    }
});

// ✅ Food Items
app.get("/api/items", async (req, res) => {
    const { country_id, branch_id } = req.query;
    if (!country_id || !branch_id)
        return res.status(400).json({ error: "country_id and branch_id are required" });
    try {
        const result = await db.query(
          `SELECT fi.id, fi.name, fi.serving_size, fi.calories, fi.total_fat, fi.saturated_fat,
                 fi.trans_fat, fi.cholesterol, fi.sodium, fi.carbohydrates, fi.sugars, fi.protein
            FROM food_items fi
            JOIN branch_locations bl ON fi.branch_location_id = bl.id
            WHERE bl.country_id = $1 AND bl.branch_id = $2`,
          [country_id, branch_id]
        );
        res.json(result.rows);
    } catch (err) {
        handleDatabaseError(res, err, "Fetch food items");
    }
});

// ✅ Single Food Item
app.get("/api/item", async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "id is required" });
    try {
        const result = await db.query("SELECT * FROM food_items WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });
        res.json(result.rows[0]);
    } catch (err) {
        handleDatabaseError(res, err, "Fetch item");
    }
});

// ✅ Add Food Item
app.post("/api/items", async (req, res) => {
    const data = req.body;
    const sql = `
      INSERT INTO food_items (
        branch_location_id, name, serving_size, calories, total_fat, saturated_fat, 
        trans_fat, cholesterol, sodium, carbohydrates, sugars, protein
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`; 
    const values = [
        data.branch_location_id, data.name, data.serving_size, data.calories,
        data.total_fat, data.saturated_fat, data.trans_fat,
        data.cholesterol, data.sodium, data.carbohydrates, data.sugars, data.protein,
    ];
    try {
        const result = await db.query(sql, values);
        res.status(201).json({ id: result.rows[0].id }); 
    } catch (err) {
        handleDatabaseError(res, err, "Insert food item");
    }
});

// ✅ Delete Food Item
app.delete("/api/items/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM food_items WHERE id = $1", [id]);
        res.sendStatus(204);
    } catch (err) {
        handleDatabaseError(res, err, "Delete food item");
    }
});


// === STATIC FILE HANDLER (AFTER API) ===
// Serve static files (CSS/JS/images) from the 'frontend' folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Root Route: Explicitly serves index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')); 
});

// Wildcard Route: Catches other specific HTML files (like item.html)
// This ensures that deep links like /item.html also resolve correctly.
app.get('/*.html', (req, res) => {
    const fileName = req.originalUrl.split('/').pop();
    res.sendFile(path.join(__dirname, '..', 'frontend', fileName));
});
// Health Check Endpoint
app.get('/health', (req, res) => {
    // This endpoint just returns a quick success status
    res.status(200).send('API is healthy');
});
// === START SERVER ===
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; 

const startServer = async () => {
    await testConnection(); 
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    });
};

startServer();