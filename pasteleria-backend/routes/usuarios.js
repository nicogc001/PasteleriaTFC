const express = require('express');
const db = require('../db');

const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, email, rol, fecha_creacion FROM usuarios');
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
