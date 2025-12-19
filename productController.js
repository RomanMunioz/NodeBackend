import db from "../db.js";

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
    const { name, description, quantity, price, category, minStock } = req.body;

    const [result] = await db.query(
      `INSERT INTO products 
       (name, description, quantity, price, category, minStock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, quantity, price, category, minStock]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      quantity,
      price,
      category,
      minStock,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product" });
  }
};

/* PUT /products/:id */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price, category, minStock } = req.body;

    await db.query(
      `UPDATE products 
       SET name=?, description=?, quantity=?, price=?, category=?, minStock=?
       WHERE id=?`,
      [name, description, quantity, price, category, minStock, id]
    );

    res.json({ message: "Product updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

/* DELETE /products/:id */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
};

/* GET /products/search?q= */
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    const [rows] = await db.query(
      `SELECT * FROM products 
       WHERE name LIKE ? OR description LIKE ?`,
      [`%${q}%`, `%${q}%`]
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
      "SELECT DISTINCT category FROM products WHERE category IS NOT NULL"
    );
    res.json(rows.map(r => r.category));
  } catch (error) {
    res.status(500).json({ message: "Error getting categories" });
  }
};
