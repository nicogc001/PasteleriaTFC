const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// Manejo de errores y reconexión automática
function connectToDatabase() {
  connection.connect((error) => {
    if (error) {
      console.error('❌ Error conectando a MySQL:', error);
      setTimeout(connectToDatabase, 5000); // Intenta reconectar en 5 segundos
    } else {
      console.log('✅ Conectado correctamente a MySQL en Railway.');
    }
  });
}

// Manejo de desconexión
connection.on('error', (err) => {
  console.error('⚠️ Error en la conexión a MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Intentando reconectar...');
    connectToDatabase();
  } else {
    throw err;
  }
});

connectToDatabase();

module.exports = connection;
