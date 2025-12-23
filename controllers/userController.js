import db from "../db.js";

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cargando usuarios" });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo usuario" });
  }
};

// Crear usuario
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    res.json({ id: result.insertId, name, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando usuario" });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [result] = await pool.query(
      `UPDATE users SET
        name = IFNULL(?, name),
        email = IFNULL(?, email),
        password = IFNULL(?, password)
      WHERE id = ?`,
      [name, email, password, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado para actualizar" });
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};
