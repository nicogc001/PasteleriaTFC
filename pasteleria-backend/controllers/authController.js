require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || "clave_super_secreta"; // Se recomienda definir en .env

// 🔹 **Registro de usuario**
exports.register = (req, res) => {
    const { username, email, password, role, direccion } = req.body;
    const userRole = role || 'cliente';

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
        'INSERT INTO usuarios (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, userRole],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al registrar el usuario.' });

            if (userRole === "cliente" && direccion) {
                db.query(
                    'INSERT INTO direcciones (usuario_id, calle, ciudad, codigo_postal, pais) VALUES (?, ?, ?, ?, ?)',
                    [result.insertId, direccion.calle, direccion.ciudad, direccion.codigo_postal, direccion.pais],
                    (err) => {
                        if (err) console.error('⚠️ Error al guardar la dirección:', err);
                    }
                );
            }

            res.status(201).json({ message: 'Usuario registrado correctamente.', id: result.insertId, role: userRole });
        }
    );
};

// 🔹 **Inicio de sesión con JWT**
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Se requieren email y contraseña." });
    }

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });

        if (results.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrecta.' });
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({ error: 'Email o contraseña incorrecta.' });
        }

        // 🔹 Generar Token JWT con expiración
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            SECRET_KEY,
            { expiresIn: "3h" }
        );

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
        if (err) return res.status(500).json({ error: 'Error al obtener los datos del usuario.' });

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json(results[0]);
    });
};

// 🔹 **Obtener perfil completo del cliente (Pedidos, Direcciones y Cupones)**
exports.obtenerPerfilCompleto = (req, res) => {
    const userId = req.user.id;

    const queryPerfil = `SELECT id, username, email, role FROM usuarios WHERE id = ?`;
    const queryPedidos = `SELECT id, fecha_pedido, estado, total FROM pedidos WHERE usuario_id = ?`;
    const queryDirecciones = `SELECT calle, ciudad, codigo_postal, pais FROM direcciones WHERE usuario_id = ?`;
    const queryCupones = `
        SELECT c.codigo, c.descuento, c.fecha_expiracion 
        FROM cupones c 
        JOIN cupones_pedidos cp ON c.id = cp.cupon_id 
        JOIN pedidos p ON cp.pedido_id = p.id 
        WHERE p.usuario_id = ?
    `;

    db.query(queryPerfil, [userId], (err, perfil) => {
        if (err) return res.status(500).json({ error: 'Error al obtener perfil.' });

        db.query(queryPedidos, [userId], (err, pedidos) => {
            if (err) return res.status(500).json({ error: 'Error al obtener pedidos.' });

            db.query(queryDirecciones, [userId], (err, direcciones) => {
                if (err) return res.status(500).json({ error: 'Error al obtener direcciones.' });

                db.query(queryCupones, [userId], (err, cupones) => {
                    if (err) return res.status(500).json({ error: 'Error al obtener cupones.' });

                    res.json({
                        perfil: perfil[0] || {},
                        pedidos: pedidos || [],
                        direcciones: direcciones || [],
                        cupones: cupones || []
                    });
                });
            });
        });
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
        req.user = decoded;
        next();
    });
};
