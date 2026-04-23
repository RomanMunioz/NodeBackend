import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
/* GET /products */
export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting products" });
  }
};

/* GET /products/:id */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error getting product" });
  }
};

/* POST /products */
export const createProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, description, quantity, price, categories, minStock } = req.body;

    const id = uuidv4(); // 👈 CLAVE

    await db.query(
      `INSERT INTO products 
       (id, name, description, quantity, price, categories, minStock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description, quantity, price, categories, minStock]
    );

    res.status(201).json({
      id,
      name,
      description,
      quantity,
      price,
      categories,
      minStock,
    });
  } catch (error) {
    console.error("CREATE ERROR:", error); // 👈 esto ahora sí nos dice TODO
    res.status(500).json({ message: "Error creating product" });
  }
};

/* PUT /products/:id */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price, categories, minStock } = req.body;

    const [result] = await db.query(
      `UPDATE products 
       SET name=?, description=?, quantity=?, price=?, categories=?, minStock=?
       WHERE id=?`,
      [name, description, quantity, price, category, minStock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

/* DELETE /products/:id */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
};

/* GET /products/search?q= */
export const searchProducts = async (req, res) => {
  try {
    const q = req.query.q || "";
    const [rows] = await db.query(
      `SELECT * FROM products 
       WHERE name LIKE ? OR description LIKE ? OR categories LIKE ?`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error searching products" });
  }
};

/* GET /products/categories */
export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT categories FROM products WHERE categories IS NOT NULL"
    );

    res.json(rows.map((r) => r.categories));
  } catch (error) {
    console.error("CATEGORIES ERROR:", error); // 👈 MUY IMPORTANTE
    res.status(500).json({ message: "Error getting categories" });
  }
};
