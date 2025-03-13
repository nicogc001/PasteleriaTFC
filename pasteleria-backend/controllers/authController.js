const db = require('../db');
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO usuarios (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, role || 'cliente'],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error en registro.');
      } else {
        res.status(201).send('Usuario registrado correctamente.');
      }
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('❌ Error en la base de datos:', err);
      return res.status(500).send('Error en la base de datos.');
    }

    if (results.length === 0) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).send('Email o contraseña incorrecta.');
    }

    const user = results[0];
    console.log('✅ Usuario encontrado:', user);

    console.log('🔹 Contraseña ingresada:', password);
    console.log('🔹 Hash almacenado en BD:', user.password);

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      console.log('❌ Contraseña incorrecta.');
      return res.status(401).send('Email o contraseña incorrecta.');
    }

    console.log('✅ Contraseña correcta. Usuario logueado.');
    res.json({
      message: 'Login correcto',
      token: "fake-jwt-token", // Si no usas JWT, puedes quitarlo
      user: {
          id: user.id,
          email: user.email,
          username: user.username,
          rol: user.role // 🔥 Asegurar que el rol está dentro de 'user'
      }
  });
  
  });
};

