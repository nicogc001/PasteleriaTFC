const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { syncDB } = require('./models');
const db = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS flexible para múltiples versiones del frontend
const allowedOrigins = [
  'https://pasteleriatfc.vercel.app',         // producción
  'http://localhost:5500'                     // desarrollo local
];

const vercelSubdomainRegex = /^https:\/\/[\w-]+-nicogc001s-projects\.vercel\.app$/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || vercelSubdomainRegex.test(origin)) {
      console.log('✅ CORS permitido para:', origin);
      callback(null, origin); // ✅ Devuelve el origin exacto para credentials:true
    } else {
      console.warn('❌ CORS bloqueado para:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests

app.use(helmet());
app.use(morgan('dev'));

// 📂 Servir archivos PDF generados desde /facturas
app.use('/facturas', express.static(path.join(__dirname, 'facturas')));

// 📦 Rutas del proyecto
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pedidos', require('./routes/pedidosRoutes'));
app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/registro-horario', require('./routes/registroHorarioRoutes'));
app.use('/api/usuario', require('./routes/usuariosRoutes'));
app.use('/api/direcciones', require('./routes/direccionesRoutes'));
app.use('/api/tartas', require('./routes/tartasRoutes'));
app.use('/api/facturas', require('./routes/facturasRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 🧾 Activar job de facturación diaria automática
require('./jobs/facturacionDiaria');

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

// 🚀 Conexión a la base de datos y arranque del servidor
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
