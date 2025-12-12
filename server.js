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

// --- Product Routes ---
// Obtener todos los productos
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Obtener categorías únicas
app.get('/products/categories', (req, res) => {
  db.query('SELECT DISTINCT category FROM products', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener categorías:', err);
      return res.status(500).json({ message: 'Error al obtener categorías' });
    }
    res.json(results.map(r => r.category));
  });
});

// Buscar productos (DEBE ir antes de /products/:id)
app.get('/products/search', (req, res) => {
  const { q } = req.query;
  console.log('Search query:', q);
  
  if (!q) {
    return res.json(products);
  }
  
  const searchResults = products.filter(product => 
    product.name.toLowerCase().includes(q.toLowerCase()) ||
    product.description.toLowerCase().includes(q.toLowerCase()) ||
    product.category.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json(searchResults);
});

// Obtener producto por ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

app.post("/products", (req, res) => {
  const { name, description, quantity, price, category, minStock } = req.body;

  const newProduct = {
    name,
    description,
    quantity,
    price,
    category,
    minStock
  };

  db.query("INSERT INTO products SET ?", newProduct, (err, result) => {
    if (err) {
      console.error("Error inserting product:", err);
      return res.status(500).json({ error: "Error creating product" });
    }

    res.status(201).json({
      id: result.insertId,
      ...newProduct
    });
  });
});


app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  products[productIndex] = updatedProduct;
  res.json(updatedProduct);
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = products.length;
  products = products.filter(p => p.id !== id);
  
  if (products.length === initialLength) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.status(204).send();
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