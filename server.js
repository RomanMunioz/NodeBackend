// backend/server.js - VERSIÓN CORREGIDA
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

import mysql from 'mysql2'; // LÍNEA MODERNA (ES MODULES)

const app = express();
const PORT = process.env.PORT || 9090;

// CORS configurado correctamente
app.use(cors({
  origin: [
    'https://RomanMunioz.github.io',
    'https://romanmunioz.github.io', // Minúsculas también
    'http://localhost:3000',
    'http://localhost:5173'
  ],
}));

app.use(express.json());

// Configura la conexión a la base de datos
// 🔹 Pool con límite bajo para Clever
const db = mysql.createPool({
  host: 'bwu90zck6cbccdzsgwfh-mysql.services.clever-cloud.com',
  user: 'uu23avzmicvruyjm',
  password: 'WLSFsFJTmd1EwGwEbbLM',
  database: 'bwu90zck6cbccdzsgwfh',
  waitForConnections: true,
  connectionLimit: 5, // ⚠️ igual al límite de Clever
  queueLimit: 0
});


let users = [];

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Inventory API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/products',
      categories: '/products/categories',
      users: '/users'
    }
  });
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ---- PRODUCT ROUTES (FULL MYSQL MODE) ----

// Get all products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Get unique categories
app.get("/products/categories", (req, res) => {
  db.query("SELECT DISTINCT category FROM products", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results.map(r => r.category));
  });
});

// Search products
app.get("/products/search", (req, res) => {
  const q = req.query.q || "";
  db.query(
    `SELECT * FROM products 
     WHERE name LIKE ? 
     OR description LIKE ?
     OR category LIKE ?`,
    [`%${q}%`, `%${q}%`, `%${q}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// Get product by ID
app.get("/products/:id", (req, res) => {
  db.query(
    "SELECT * FROM products WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ error: "Product not found" });
      res.json(results[0]);
    }
  );
});

// Create product
app.post("/products", (req, res) => {
  const product = req.body;

  db.query("INSERT INTO products SET ?", product, (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });

    res.status(201).json({ id: result.insertId, ...product });
  });
});

// Update product
app.put("/products/:id", (req, res) => {
  db.query(
    "UPDATE products SET ? WHERE id = ?",
    [req.body, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Product not found" });

      res.json({ id: req.params.id, ...req.body });
    }
  );
});

// Delete product
app.delete("/products/:id", (req, res) => {
  db.query(
    "DELETE FROM products WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Product not found" });

      res.status(204).send();
    }
  );
});


// --- User Routes ---
app.get('/users', (req, res) => {
  console.log('GET /users called');
  res.json(users);
});

// Buscar usuarios (DEBE ir antes de /users/:id)
app.get('/users/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json(users);
  }
  
  const searchResults = users.filter(user => 
    user.username.toLowerCase().includes(q.toLowerCase()) ||
    user.email.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json(searchResults);
});

// Obtener usuario por ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json(user);
});

// Crear usuario
app.post('/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Actualizar usuario
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const updatedUser = {
    ...users[userIndex],
    ...req.body
  };
  users[userIndex] = updatedUser;
  res.json(updatedUser);
});

// Eliminar usuario
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = users.length;
  users = users.filter(u => u.id !== parseInt(id));
  
  if (users.length === initialLength) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.status(204).send();
});

// 404 para rutas no definidas
app.all("/*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});


// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  
  console.log(`✅ Backend server is running on port ${PORT}`);
  console.log('📍 Available endpoints:');
  console.log('   - GET /health');
  console.log('   - GET /products');
  console.log('   - GET /products/categories');
  console.log('   - GET /products/search?q=query');
  console.log('   - GET /users');
  console.log('   - GET /users/search?q=query');
  console.log('🚀 Server started successfully!');
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});