// backend/server.js
// 1) .env SIEMPRE primero
const dotenv = require("dotenv");
dotenv.config();

// 2) Imports base
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const { syncDB } = require("./models");
const db = require("./config/db");

// 3) Crea la app
const app = express();

// 4) Middlewares globales
app.use(express.json());

const allowedOrigins = [
  "https://pasteleriatfc.vercel.app",
  "https://pasteleria-tfc-front.vercel.app",
  "http://localhost:5500",
];
const vercelSubdomainRegex =
  /^https:\/\/[\w-]+-nicogc001s-projects\.vercel\.app$/;

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      vercelSubdomainRegex.test(origin)
    ) {
      console.log("CORS permitido para:", origin);
      callback(null, origin);
    } else {
      console.warn("CORS bloqueado para:", origin);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-test-token"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(helmet());
app.use(morgan("dev"));

// 5) Verificar SMTP (después de dotenv)
const { verifyMailer } = require("./lib/mailer");
verifyMailer();

// 6) Archivos estáticos
app.use("/facturas", express.static(path.join(__dirname, "facturas")));
app.use("/cv", express.static("/tmp"));

// 7) Rutas
const testEmailRoute = require("./routes/testEmail"); // importa aquí
app.use(testEmailRoute); // y usa DESPUÉS de crear app

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/pedidos", require("./routes/pedidosRoutes"));
app.use("/api/productos", require("./routes/productosRoutes"));
app.use("/api/registro-horario", require("./routes/registroHorarioRoutes"));
app.use("/api/usuarios", require("./routes/usuariosRoutes"));
app.use("/api/direcciones", require("./routes/direccionesRoutes"));
app.use("/api/tartas", require("./routes/tartasRoutes"));
app.use("/api/facturas", require("./routes/facturasRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ofertas", require("./routes/ofertasRoutes"));
app.use("/api/vacaciones", require("./routes/vacacionesRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/empleo", require("./routes/empleoRoutes"));
app.use("/api/dev", require("./routes/devRoutes"));

// 8) Tareas programadas
require("./jobs/facturacionDiaria");

// 9) Raíz y manejo de errores
app.get("/", (req, res) => res.send("Backend funcionando correctamente"));
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

// 10) Arranque
(async () => {
  try {
    await db.authenticate();
    console.log("Conectado a la base de datos correctamente");

    // await syncDB();
    await db.sync({ alter: true });
    console.log("Base de datos sincronizada correctamente");

    const { db: models } = require("./models");
    console.log("Modelos registrados en Sequelize:");
    console.log(Object.keys(models.models || models));

    const allModels = require("./models");
    console.log("✅ Modelos registrados en Sequelize:");
    console.log(Object.keys(allModels));

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () =>
      console.log(`Servidor corriendo en http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Error conectando a la base de datos:", error);
    process.exit(1);
  }
})();
