const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "clave_super_secreta"; // 🔹 Se recomienda guardar en .env

// 🔹 **Registro de usuario**
exports.register = (req, res) => {
    const { username, email, password, role } = req.body;
    const userRole = role || 'cliente'; // 🔹 Si no se envía rol, asigna "cliente"

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
        'INSERT INTO usuarios (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, userRole],
        (err, result) => {
            if (err) {
                console.error('❌ Error en la base de datos:', err);
                return res.status(500).json({ error: 'Error al registrar el usuario.' });
            }
            res.status(201).json({ message: 'Usuario registrado correctamente.', id: result.insertId, role: userRole });
        }
    );
};

// 🔹 **Inicio de sesión con JWT**
exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            return res.status(500).json({ error: 'Error en la base de datos.' });
        }

        if (results.length === 0) {
            console.log('❌ Usuario no encontrado:', email);
            return res.status(401).json({ error: 'Email o contraseña incorrecta.' });
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            console.log('❌ Contraseña incorrecta.');
            return res.status(401).json({ error: 'Email o contraseña incorrecta.' });
        }

        // 🔹 Generar Token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            SECRET_KEY,
            { expiresIn: "3h" }
        );

        console.log('✅ Usuario autenticado con éxito.');
        res.json({
            message: 'Login correcto',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    });
};

// 🔹 **Obtener información del usuario autenticado**
exports.getUserProfile = (req, res) => {
    const userId = req.user.id;

    db.query('SELECT id, username, email, role FROM usuarios WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            return res.status(500).json({ error: 'Error al obtener los datos del usuario.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json(results[0]);
    });
};

// 🔹 **Middleware para verificar autenticación con JWT**
exports.verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ error: "No se proporcionó un token." });
    }

    jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token no válido." });
        }
        req.user = decoded; // Almacena los datos del usuario autenticado en `req.user`
        next();
    });
};
