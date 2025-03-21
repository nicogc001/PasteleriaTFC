const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// 🧠 Obtener datos del usuario autenticado
// 🧠 Ruta protegida para obtener datos del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await Usuario.findByPk(req.user.id, {
            attributes: ['id', 'nombre', 'email', 'telefono', 'empresa', 'cif', 'apellidos', 'rol']
        });

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        console.error("❌ Error obteniendo usuario:", err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ✅ Ruta para actualizar datos del usuario
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const user = await Usuario.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const { nombre, email, telefono, empresa, cif, apellidos } = req.body;

        user.nombre = nombre;
        user.email = email;
        user.telefono = telefono;
        user.empresa = empresa;
        user.cif = cif;
        user.apellidos = apellidos;

        await user.save();

        res.json({ message: 'Perfil actualizado correctamente', user });
    } catch (error) {
        console.error('❌ Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error actualizando perfil' });
    }
});

const bcrypt = require('bcryptjs');

// Cambiar contraseña del usuario logueado
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { actual, nueva } = req.body;

        if (!actual || !nueva) {
            return res.status(400).json({ error: 'Debes proporcionar la contraseña actual y la nueva.' });
        }

        const usuario = await Usuario.findByPk(req.user.id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar que la contraseña actual sea correcta
        const esCorrecta = await bcrypt.compare(actual, usuario.password);
        if (!esCorrecta) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Encriptar y guardar la nueva contraseña
        const hashedNueva = await bcrypt.hash(nueva, 10);
        usuario.password = hashedNueva;
        await usuario.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error("❌ Error cambiando contraseña:", err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


module.exports = router;
