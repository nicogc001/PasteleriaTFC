const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const empleadosRoutes = require('./routes/empleadosRoutes');
const usuariosRoutes = require('./routes/usuarios');

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Configuración correcta de CORS
app.use(cors({
    origin: "https://pasteleriatfc-front.onrender.com",
    credentials: true
}));

// ✅ Eliminar configuración errónea de CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://pasteleriatfc-front.onrender.com"); 
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

// ✅ Registrar rutas correctamente
app.use('/api/auth', authRoutes); 
app.use('/api/empleado', empleadosRoutes);
app.use('/api', usuariosRoutes);

// ✅ Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Backend funcionando correctamente!');
});

// ✅ Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// ✅ Manejo de errores generales
app.use((err, req, res, next) => {
    console.error("❌ Error en el servidor:", err);
    res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
