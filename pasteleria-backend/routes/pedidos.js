const express = require('express');
const pool = require('../db'); // Conexión a MySQL
const authMiddleware = require('../middleware/authMiddleware'); // Verifica la sesión

const router = express.Router();

// ✅ Obtener pedidos del usuario autenticado desde la base de datos
router.get('/pedidos', authMiddleware, async (req, res) => {
    try {
        const [pedidos] = await pool.query(
            "SELECT id, fecha, total, estado FROM pedidos WHERE usuario_id = ?",
            [req.session.user.id]
        );

        res.json(pedidos);
    } catch (error) {
        console.error("Error obteniendo pedidos:", error);
        res.status(500).json({ error: "Error al obtener los pedidos" });
    }
});

module.exports = router;
