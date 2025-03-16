const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// ✅ Configurar CORS
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());

// ✅ Importar rutas
const authRoutes = require('./routes/authRoutes');  // 🔹 Asegúrate de que este archivo existe
const empleadosRoutes = require('./routes/empleadosRoutes');  // 🔹 Asegúrate de que este archivo existe
const usuariosRoutes = require('./routes/usuarios'); 

// ✅ Definir los endpoints base
app.use('/api/auth', authRoutes); 
app.use('/api/empleado', empleadosRoutes);
app.use('/api', usuariosRoutes);

// ✅ Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
