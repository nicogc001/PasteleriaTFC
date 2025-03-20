const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Usuario = require('../models/Usuario'); // 📌 Asegurar que importamos el modelo correcto
const router = express.Router();

// Obtener datos del usuario autenticado desde la base de datos
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Buscar el usuario en la base de datos por su ID
        const usuario = await Usuario.findByPk(req.user.id, {
            attributes: ['id', 'nombre', 'email', 'rol']
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado en la base de datos' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('❌ Error al obtener usuario desde la base de datos:', error);
        res.status(500).json({ error: 'Error en el servidor al consultar la base de datos' });
    }
});

module.exports = router;
