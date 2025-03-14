const db = require('../db');
const bcrypt = require('bcryptjs');

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
    (err) => {
      if (err) {
        console.error('❌ Error en la base de datos:', err);
        return res.status(500).json({ error: 'Error al registrar el usuario.' });
      }
      res.status(201).json({ message: 'Usuario registrado correctamente.', role: userRole });
    }
  );
};

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
    console.log('✅ Usuario encontrado:', user);

    console.log('🔹 Contraseña ingresada:', password);
    console.log('🔹 Hash almacenado en BD:', user.password);

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      console.log('❌ Contraseña incorrecta.');
      return res.status(401).json({ error: 'Email o contraseña incorrecta.' });
    }

    console.log('✅ Contraseña correcta. Usuario logueado.');
    res.json({
      message: 'Login correcto',
      token: "fake-jwt-token", // 🔹 Puedes cambiar esto a un JWT real en el futuro
      user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role || user.rol  // 🔹 Se asegura de devolver siempre "role"
      }
    });
  });
};
