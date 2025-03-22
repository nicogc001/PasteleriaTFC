const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { syncDB } = require('./models');
const db = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS flexible para múltiples versiones del frontend
const allowedOrigins = [
  'https://pasteleriatfc.vercel.app', // producción fija
  'http://localhost:5500'             // desarrollo local
];

// 🔁 Regex para aceptar cualquier subdominio de Vercel de tu cuenta
const vercelSubdomainRegex = /^https:\/\/[\w-]+-nicogc001s-projects\.vercel\.app$/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || vercelSubdomainRegex.test(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ Origen no permitido por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Aplica CORS y responde a preflights
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(morgan('dev'));

// 📦 Rutas del proyecto
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pedidos', require('./routes/pedidosRoutes'));
app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/registro-horario', require('./routes/registroHorarioRoutes'));
app.use('/api/usuario', require('./routes/usuariosRoutes'));
app.use('/api/direcciones', require('./routes/direccionesRoutes'));
app.use('/api/tartas', require('./routes/tartasRoutes'));

// 🧪 Ruta base de prueba
app.get('/', (req, res) => {
  res.send('🚀 Backend funcionando correctamente');
});

// 🔍 Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 🧯 Middleware global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error en el servidor:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 🚀 Conexión a BD y arranque
(async () => {
  try {
    await db.authenticate();
    console.log('✅ Conectado a la base de datos correctamente');

    await syncDB();
    console.log('✅ Base de datos sincronizada correctamente');

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
})();
