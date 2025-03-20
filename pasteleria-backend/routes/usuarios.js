const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db"); // Conexión a MySQL
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Middleware de autenticación
const router = express.Router();

// ✅ Obtener datos del usuario autenticado desde la sesión
router.get("/usuario", authMiddleware, (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(403).json({ error: "No hay sesión activa" });
        }
        res.json(req.session.user);
    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ✅ Registro de usuario
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

module.exports = router;
