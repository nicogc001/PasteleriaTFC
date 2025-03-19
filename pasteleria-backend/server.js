const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// ✅ Configurar CORS globalmente para permitir todas las peticiones
app.use(cors());
app.use(express.json());

// ✅ Habilitar CORS en respuestas preflight
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

    // 🔹 Nueva configuración de Content Security Policy (CSP)
    res.setHeader(
        "Content-Security-Policy",
        "default-src *; connect-src *; script-src * 'unsafe-inline' 'unsafe-eval'; " +
        "style-src * 'unsafe-inline'; img-src * data:;"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    next();
});

// ✅ Importar rutas con la ruta correcta
const authRoutes = require('./routes/authRoutes');  
const empleadosRoutes = require('./routes/empleadosRoutes');  
const usuariosRoutes = require('./routes/usuarios');  

console.log("🔍 Probando carga de rutas...");
console.log("📌 Ruta auth:", authRoutes ? "Cargada" : "❌ No encontrada");
console.log("📌 Ruta empleados:", empleadosRoutes ? "Cargada" : "❌ No encontrada");
console.log("📌 Ruta usuarios:", usuariosRoutes ? "Cargada" : "❌ No encontrada");

app.use('/api/auth', authRoutes); 
app.use('/api/empleado', empleadosRoutes);
app.use('/api', usuariosRoutes);

console.log("✅ Rutas cargadas correctamente.");


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

// ✅ Arrancar el servidor en el puerto configurado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
