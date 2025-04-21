const db = require('../config/db');

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

// Reunimos todos los modelos
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
  VacasSolicitud
};

// Asociaciones por separado (por si hay lógica en associate())
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Relaciones explícitas (puedes mantenerlas si quieres control extra)
Usuario.hasOne(Carrito, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Usuario.hasMany(Pedidos, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Pedidos.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Usuario.hasMany(Direccion, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Direccion.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Carrito.hasMany(ProductosCarrito, { foreignKey: 'carritoId', onDelete: 'CASCADE' });
ProductosCarrito.belongsTo(Carrito, { foreignKey: 'carritoId' });

Productos.hasMany(ProductosCarrito, { foreignKey: 'productoId', onDelete: 'CASCADE' });
ProductosCarrito.belongsTo(Productos, { foreignKey: 'productoId' });

Pedidos.hasMany(ProductosPedidos, { foreignKey: 'pedidoId', onDelete: 'CASCADE' });
ProductosPedidos.belongsTo(Pedidos, { foreignKey: 'pedidoId' });

Productos.hasMany(ProductosPedidos, { foreignKey: 'productoId', onDelete: 'CASCADE' });
ProductosPedidos.belongsTo(Productos, { foreignKey: 'productoId' });

Productos.hasMany(Ofertas, { foreignKey: 'productoId', onDelete: 'CASCADE' });
Ofertas.belongsTo(Productos, { foreignKey: 'productoId' });

Productos.hasMany(HistorialStock, { foreignKey: 'productoId', onDelete: 'CASCADE' });
HistorialStock.belongsTo(Productos, { foreignKey: 'productoId' });

Usuario.hasMany(RegistroHorarios, { foreignKey: 'empleadoId', onDelete: 'CASCADE' });
RegistroHorarios.belongsTo(Usuario, { foreignKey: 'empleadoId' });

Usuario.hasMany(VacasSolicitud, { foreignKey: 'empleado_id', onDelete: 'CASCADE' });
VacasSolicitud.belongsTo(Usuario, { foreignKey: 'empleado_id', as: 'empleado' });

Ofertas.belongsToMany(Usuario, {
  through: OfertasCliente,
  foreignKey: 'ofertaId',
  otherKey: 'userId',
  as: 'usuarios'
});

Usuario.belongsToMany(Ofertas, {
  through: OfertasCliente,
  foreignKey: 'userId',
  otherKey: 'ofertaId',
  as: 'ofertas'
});


// Sync
const syncDB = async () => {
  try {
    await db.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

module.exports = {
  db,
  syncDB,
  ...models
};
