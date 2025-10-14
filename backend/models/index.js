// backend/models/index.js
const db = require('../config/db');
const { DataTypes } = require('sequelize');

// Modelos base (init directos)
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Carrito = require('./Carrito');
const Productos = require('./Productos');
const Pedidos = require('./Pedidos');
const ProductosCarrito = require('./ProductosCarrito');
const ProductosPedidos = require('./ProductosPedidos');
const Ofertas = require('./Ofertas');
const RegistroHorarios = require('./RegistroHorarios');
const Direccion = require('./Direccion');
const HistorialStock = require('./HistorialStock');
const OfertasCliente = require('./OfertasCliente');
const SolicitudEmpleo = require('./SolicitudEmpleo');
const VacasSolicitud = require('./VacasSolicitud');
// Modelos con factory (función)
const Chat = require('./Chat')(db, DataTypes);
const Mensaje = require('./Mensaje')(db, DataTypes);
// Nuevos
const EmailLog = require('./EmailLog');

// Registro de modelos en un objeto (para .associate si existiera)
const models = {
  Usuario,
  Rol,
  Carrito,
  Productos,
  Pedidos,
  ProductosCarrito,
  ProductosPedidos,
  Ofertas,
  RegistroHorarios,
  Direccion,
  HistorialStock,
  OfertasCliente,
  SolicitudEmpleo,
  VacasSolicitud,
  Chat,
  Mensaje,
  EmailLog,
};

// Ejecuta associate() si algún modelo lo define
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

/* =========================
   Asociaciones explícitas
   ========================= */

// Usuario ⇄ Carrito
Usuario.hasOne(Carrito, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Usuario ⇄ Direccion
Usuario.hasMany(Direccion, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Direccion.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Usuario (cliente) ⇄ Pedidos  (alias 'cliente' en el belongsTo)
Usuario.hasMany(Pedidos, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Pedidos.belongsTo(Usuario, { as: 'cliente', foreignKey: 'usuarioId' });

// Pedidos ⇄ Dirección (para envíos)
Pedidos.belongsTo(Direccion, { foreignKey: 'direccionId' });
Direccion.hasMany(Pedidos, { foreignKey: 'direccionId' });

// Pedidos ⇄ ProductosPedidos ⇄ Productos (líneas de pedido)
Pedidos.hasMany(ProductosPedidos, { foreignKey: 'pedidoId', onDelete: 'CASCADE' });
ProductosPedidos.belongsTo(Pedidos, { foreignKey: 'pedidoId' });

Productos.hasMany(ProductosPedidos, { foreignKey: 'productoId', onDelete: 'CASCADE' });
ProductosPedidos.belongsTo(Productos, { foreignKey: 'productoId' });

// Carrito ⇄ ProductosCarrito ⇄ Productos
Carrito.hasMany(ProductosCarrito, { foreignKey: 'carritoId', onDelete: 'CASCADE' });
ProductosCarrito.belongsTo(Carrito, { foreignKey: 'carritoId' });

Productos.hasMany(ProductosCarrito, { foreignKey: 'productoId', onDelete: 'CASCADE' });
ProductosCarrito.belongsTo(Productos, { foreignKey: 'productoId' });

// Productos ⇄ Ofertas
Productos.hasMany(Ofertas, { foreignKey: 'productoId', onDelete: 'CASCADE' });
Ofertas.belongsTo(Productos, { foreignKey: 'productoId' });

// Productos ⇄ HistorialStock
Productos.hasMany(HistorialStock, { foreignKey: 'productoId', onDelete: 'CASCADE' });
HistorialStock.belongsTo(Productos, { foreignKey: 'productoId' });

// Usuario (empleado) ⇄ RegistroHorarios
Usuario.hasMany(RegistroHorarios, { foreignKey: 'empleadoId', onDelete: 'CASCADE' });
RegistroHorarios.belongsTo(Usuario, { foreignKey: 'empleadoId' });

// Vacaciones (empleado)
Usuario.hasMany(VacasSolicitud, { foreignKey: 'empleado_id', onDelete: 'CASCADE' });
VacasSolicitud.belongsTo(Usuario, { foreignKey: 'empleado_id', as: 'empleado' });

// Aprobadores de pedido (empleado/admin)
Usuario.hasMany(Pedidos, { foreignKey: 'aprobadorId', as: 'AprobacionesEmpleado' });
Usuario.hasMany(Pedidos, { foreignKey: 'segundoAprobadorId', as: 'AprobacionesAdmin' });

Pedidos.belongsTo(Usuario, { foreignKey: 'aprobadorId', as: 'AprobadorEmpleado' });
Pedidos.belongsTo(Usuario, { foreignKey: 'segundoAprobadorId', as: 'AprobadorAdmin' });

// Ofertas ⇄ Usuarios (M:N)
Ofertas.belongsToMany(Usuario, {
  through: OfertasCliente,
  foreignKey: 'ofertaId',
  otherKey: 'userId',
  as: 'usuarios',
});
Usuario.belongsToMany(Ofertas, {
  through: OfertasCliente,
  foreignKey: 'userId',
  otherKey: 'ofertaId',
  as: 'ofertas',
});

/* =========================
   Sincronización
   ========================= */
const syncDB = async () => {
  try {
    await db.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

/* =========================
   Exportación unificada
   ========================= */
module.exports = {
  db,
  syncDB,
  ...models,
};
