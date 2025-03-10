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
    if (err || results.length === 0) {
      return res.status(401).send('Email o contraseña incorrecta.');
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send('Email o contraseña incorrecta.');
    }

    res.json({ message: 'Login correcto', userId: user.id, role: user.role });
  });
};
