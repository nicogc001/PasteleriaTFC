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
    res.json({ message: 'Login correcto', userId: user.id, role: user.role });
  });
};
