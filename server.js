// backend/server.js

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2'); // Importa la biblioteca de MySQL

const app = express();
const PORT = 9090; // Use the same port as in your frontend's api.ts

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// A simple in-memory "database" to hold your products
let products = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", // unique ID
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

// --- Product Routes ---
app.get('/products', (req, res) => {
  res.json(products);
});

app.post('/products', (req, res) => {
  const newProduct = {
    id: uuidv4(), // Generates a unique ID
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

  res.status(204).send(); // No content
});

// --- User Routes (as an example) ---
app.get('/users', (req, res) => {
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:9090`);
});