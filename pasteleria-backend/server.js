const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
app.use(cors({origin: "*"})); // permite todas las solicitudes

// Configurar variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
app.use('/api', usuariosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
