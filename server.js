// backend/server.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 9090;

// ✅ CORS configurado correctamente
app.use(cors({
  origin: [
    'https://RomanMunioz.github.io',
    'http://localhost:3000', // Para desarrollo local
    'http://localhost:5173'  // Para Vite
  ],
  credentials: true
}));

app.use(express.json());

// Configura la conexión a la base de datos
const db = mysql.createPool({
  host: 'bwu90zck6cbccdzsgwfh-mysql.services.clever-cloud.com',
  user: 'uu23avzmicvruyjm',
  password: 'WLSFsFJTmd1EwGwEbbLM',
  database: 'bwu90zck6cbccdzsgwfh'
});

// In-memory database
let products = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "Laptop",
    description: "High-performance laptop for professional use.",
    quantity: 50,
    price: 1200.00,
    category: "Electronics",
    minStock: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "b1c2d3e4-f5a6-7890-1234-567890abcdef",
    name: "Smartphone",
    description: "Latest model with a high-resolution camera.",
    quantity: 200,
    price: 800.00,
    category: "Electronics",
    minStock: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c1d2e3f4-g5h6-7890-1234-567890abcdef",
    name: "Coffee Mug",
    description: "Ceramic mug for your morning coffee.",
    quantity: 500,
    price: 15.00,
    category: "Home Goods",
    minStock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let users = [];

// ✅ Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// --- Product Routes ---
app.get('/products', (req, res) => {
  console.log('GET /products called');
  res.json(products);
});

// ✅ Nueva ruta: Obtener producto por ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// ✅ Nueva ruta: Buscar productos
app.get('/products/search', (req, res) => {
  const { q } = req.query;
  
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

// ✅ Nueva ruta: Obtener categorías únicas
app.get('/products/categories', (req, res) => {
  console.log('GET /products/categories called');
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

app.post('/products', (req, res) => {
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
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
  res.json(users);
});

// ✅ Nueva ruta: Obtener usuario por ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json(user);
});

// ✅ Nueva ruta: Buscar usuarios
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

// ✅ Crear usuario
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

// ✅ Actualizar usuario
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

// ✅ Eliminar usuario
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = users.length;
  users = users.filter(u => u.id !== parseInt(id));
  
  if (users.length === initialLength) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.status(204).send();
});

// ✅ Middleware para rutas no encontradas
app.use('*', (req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    url: req.originalUrl
  });
});

// ✅ Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET /health');
  console.log('- GET /products');
  console.log('- GET /products/categories');
  console.log('- GET /products/search?q=query');
  console.log('- GET /users');
  console.log('- GET /users/search?q=query');
});