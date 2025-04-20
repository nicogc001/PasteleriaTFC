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

// CORS: permitir solo orígenes específicos (no comodines si hay credenciales)
const allowedOrigins = [
  'https://pasteleriatfc.vercel.app',
  'http://localhost:5500'
];
const vercelSubdomainRegex = /^https:\/\/[\w-]+-nicogc001s-projects\.vercel\.app$/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || vercelSubdomainRegex.test(origin)) {
      console.log('CORS permitido para:', origin);
      callback(null, origin); // Devuelve el origin en vez de '*'
    } else {
      console.warn('CORS bloqueado para:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests

// Cabecera manual para habilitar credenciales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(helmet());
app.use(morgan('dev'));

// Archivos estáticos: facturas PDF
app.use('/facturas', express.static(path.join(__dirname, 'facturas')));

// Rutas de la API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pedidos', require('./routes/pedidosRoutes'));
app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/registro-horario', require('./routes/registroHorarioRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/direcciones', require('./routes/direccionesRoutes'));
app.use('/api/tartas', require('./routes/tartasRoutes'));
app.use('/api/facturas', require('./routes/facturasRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ofertas', require('./routes/ofertasRoutes'));

// Facturación diaria automática
require('./jobs/facturacionDiaria');

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente');
});

// Subida de CVs: servir archivos temporales desde /tmp
app.use('/cv', express.static('/tmp'));

// Nueva ruta para solicitudes de empleo
app.use('/api/empleo', require('./routes/empleoRoutes'));

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware global de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar servidor
(async () => {
  try {
    await db.authenticate();
    console.log('Conectado a la base de datos correctamente');

    await syncDB();
    console.log('Base de datos sincronizada correctamente');

    const { db: models } = require('./models');

    console.log('Modelos registrados en Sequelize:');
    console.log(Object.keys(models.models || models));


    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    process.exit(1);
  }
})();
