const bcrypt = require("bcrypt");
const express = require("express");
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

module.exports = router;
