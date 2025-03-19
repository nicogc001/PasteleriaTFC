const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const pool = require("../db"); // Conexión a MySQL

router.post("/register", async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, 'cliente')",
            [nombre, email, hashedPassword]
        );

        res.status(201).json({ mensaje: "Usuario registrado con éxito", userId: result.insertId });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Nueva ruta para obtener los datos del usuario autenticado
router.get("/usuario", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(403).json({ error: "No autorizado" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const [rows] = await pool.query("SELECT id, nombre, email FROM usuarios WHERE id = ?", [decoded.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        res.status(401).json({ error: "Token inválido" });
    }
});

app.use('/api/usuario', verificarToken, usuariosRoutes);


module.exports = router;
