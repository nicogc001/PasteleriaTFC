const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db"); // Conexión a MySQL
const router = express.Router();

// ✅ Login de usuario con sesiones
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // ✅ Guardar usuario en la sesión
        req.session.user = {
            id: user.id,
            nombre: user.nombre,
            email: user.email
        };

        res.json({ mensaje: "Inicio de sesión exitoso", usuario: req.session.user });
    } catch (error) {
        console.error("Error en login:", error);
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

// ✅ Logout de usuario
router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Error cerrando sesión" });
        }
        res.json({ mensaje: "Sesión cerrada correctamente" });
    });
});

module.exports = router;
