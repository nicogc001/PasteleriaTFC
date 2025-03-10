const express = require('express');
const cors = require('cors');
const db = require('./db'); // Verifica que la conexión a la base de datos es correcta
const authRoutes = require('./routes/authRoutes'); // Importa las rutas

const app = express();

app.use(express.json());
app.use(cors());

// Carga correctamente las rutas de autenticación
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('¡Backend funcionando correctamente!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
