import express from "express";
import cors from "cors";
import { Pool } from "pg";
import Redis from "ioredis";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL usando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "taskdb",
  user: process.env.DB_USER || "taskuser",
  password: process.env.DB_PASSWORD || "taskpass",
});

// Conexión a Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

redis.on("connect", () => console.log("✅ Redis conectado"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

// Inicializar tabla al arrancar
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id        SERIAL PRIMARY KEY,
      title     VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("✅ Base de datos inicializada");
}

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected", timestamp: new Date() });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// GET /tasks — con caché
app.get("/tasks", async (req, res) => {
  const CACHE_KEY = "tasks:all";
  const TTL = 30; // segundos

  // 1. Intentar leer desde Redis
  const cached = await redis.get(CACHE_KEY);

  if (cached) {
    console.log("🔴 Cache HIT — respondiendo desde Redis");
    return res.json(JSON.parse(cached));
  }

  // 2. Cache miss — ir a PostgreSQL
  console.log("🐘 Cache MISS — consultando PostgreSQL");
  const result = await pool.query(
    "SELECT * FROM tasks ORDER BY created_at DESC",
  );

  // 3. Guardar en Redis con TTL de 30 segundos
  await redis.setex(CACHE_KEY, TTL, JSON.stringify(result.rows));

  res.json(result.rows);
});

// POST /tasks
app.post("/tasks", async (req, res) => {
  const { title } = req.body;
  const result = await pool.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
    [title],
  );

  // Invalidar caché — los datos cambiaron
  await redis.del("tasks:all");
  console.log("🗑️  Caché invalidado — tarea creada");

  res.status(201).json(result.rows[0]);
});

// PUT /tasks/:id
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const result = await pool.query(
    "UPDATE tasks SET completed=$1 WHERE id=$2 RETURNING *",
    [completed, id],
  );

  // Invalidar caché — los datos cambiaron
  await redis.del("tasks:all");
  console.log("🗑️  Caché invalidado — tarea actualizada");

  res.json(result.rows[0]);
});

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req, res) => {
  await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);

  // Invalidar caché — los datos cambiaron
  await redis.del("tasks:all");
  console.log("🗑️  Caché invalidado — tarea eliminada");

  res.status(204).send();
});

// Arrancar servidor
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  console.log(`📦 DB Host: ${process.env.DB_HOST || "localhost"}`);
});
