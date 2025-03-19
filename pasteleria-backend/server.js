const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// ✅ Configurar CORS globalmente para permitir todas las peticiones
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));

// ✅ Habilitar CORS en respuestas preflight
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

    // 📌 Permitir conexiones desde cualquier origen
    res.setHeader("Content-Security-Policy", "default-src *; connect-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    next();
});


// ✅ Middleware para interpretar JSON
app.use(express.json());

// ✅ Importar rutas
const authRoutes = require('./routes/authRoutes');  // 🔹 Asegúrate de que este archivo existe
const empleadosRoutes = require('./routes/empleadosRoutes');  // 🔹 Asegúrate de que este archivo existe
const usuariosRoutes = require('./routes/usuarios'); 

// ✅ Definir los endpoints base
app.use('/api/auth', authRoutes); 
app.use('/api/empleado', empleadosRoutes);
app.use('/api', usuariosRoutes);

// ✅ Ruta de prueba para verificar que el servidor está activo
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
