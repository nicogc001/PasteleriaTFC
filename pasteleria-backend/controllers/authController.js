require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || "clave_super_secreta"; // Se recomienda definir en .env

const token = jwt.sign({ id: user.id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "3h" });
const decoded = jwt.verify(token.split(' ')[1], process.env.SECRET_KEY);



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

            // Si el usuario es un cliente, agregar su dirección
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

// 🔹 **Obtener información del usuario autenticados**
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

// 🔹 **Obtener perfil completo del cliente con consultas paralelas**
exports.obtenerPerfilCompleto = async (req, res) => {
    const userId = req.user.id;

    try {
        const [perfil, pedidos, direcciones, cupones] = await Promise.all([
            new Promise((resolve, reject) => db.query(`SELECT id, username, email, role FROM usuarios WHERE id = ?`, [userId], (err, res) => err ? reject(err) : resolve(res[0]))),
            new Promise((resolve, reject) => db.query(`SELECT id, fecha_pedido, estado, total FROM pedidos WHERE usuario_id = ?`, [userId], (err, res) => err ? reject(err) : resolve(res))),
            new Promise((resolve, reject) => db.query(`SELECT calle, ciudad, codigo_postal, pais FROM direcciones WHERE usuario_id = ?`, [userId], (err, res) => err ? reject(err) : resolve(res))),
            new Promise((resolve, reject) => db.query(`
                SELECT c.codigo, c.descuento, c.fecha_expiracion 
                FROM cupones c 
                JOIN cupones_pedidos cp ON c.id = cp.cupon_id 
                JOIN pedidos p ON cp.pedido_id = p.id 
                WHERE p.usuario_id = ?`, [userId], (err, res) => err ? reject(err) : resolve(res)))
        ]);

        res.json({ perfil, pedidos, direcciones, cupones });

    } catch (error) {
        console.error('❌ Error al obtener datos:', error);
        res.status(500).json({ error: 'Error al obtener perfil completo.' });
    }
};

// 🔹 **Middleware para verificar autenticación con JWT**
exports.verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ error: "No se proporcionó un token." });
    }

    jwt.verify(token.replace("Bearer ", ""), process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token no válido." });
        }
        req.user = decoded; // ✅ Aquí se asigna el usuario autenticado
        next();
    });
};


exports.registrarHorario = (req, res) => {
    console.log("📥 Recibida solicitud en /registro-horario");
    console.log("📝 Datos recibidos:", req.body);

    const empleadoId = req.user.id; // Obtener ID del empleado desde el JWT
    const { fecha, hora_entrada, hora_salida } = req.body;

    if (!fecha || !hora_entrada) {
        return res.status(400).json({ error: "Fecha y hora de entrada son obligatorias." });
    }

    const query = `
        INSERT INTO registro_horario (empleado_id, fecha, hora_entrada, hora_salida) 
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [empleadoId, fecha, hora_entrada, hora_salida || null], (err, result) => {
        if (err) {
            console.error("❌ Error en MySQL:", err);
            return res.status(500).json({ error: "Error al registrar horario." });
        }
        console.log("✅ Horario registrado correctamente:", result);
        res.status(201).json({ message: "Horario registrado correctamente." });
    });
};


exports.obtenerHorarios = (req, res) => {
    const empleadoId = req.user.id; // 👀 Verifica que `req.user.id` no sea undefined
    console.log("📥 Buscando horarios para empleado ID:", empleadoId);

    if (!empleadoId) {
        return res.status(400).json({ error: "No se encontró el ID del empleado." });
    }

    const query = 'SELECT fecha, hora_entrada, hora_salida FROM registro_horario WHERE empleado_id = ?';

    db.query(query, [empleadoId], (err, results) => {
        if (err) {
            console.error('❌ Error en la base de datos:', err);
            return res.status(500).json({ error: 'Error al obtener los horarios.' });
        }

        console.log("✅ Horarios obtenidos:", results);
        res.json(results);
    });
};


