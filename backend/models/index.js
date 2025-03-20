const db = require('../config/db');
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Carrito = require('./Carrito');
const Productos = require('./Productos');
const Pedidos = require('./Pedidos');
const ProductosCarrito = require('./ProductosCarrito');
const ProductosPedidos = require('./ProductosPedidos');
const Ofertas = require('./Ofertas');
const RegistroHorario = require('./RegistroHorarios'); // Agregar modelo


// Definir relaciones entre modelos
Usuario.hasOne(Carrito, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Usuario.hasMany(Pedidos, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Pedidos.belongsTo(Usuario, { foreignKey: 'usuarioId' });

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

// Sincronizar los modelos con la base de datos
const syncDB = async () => {
    try {
        await db.sync({ alter: true });
        console.log('✅ Base de datos sincronizada correctamente');
    } catch (error) {
        console.error('❌ Error al sincronizar la base de datos:', error);
    }
};

module.exports = { db, syncDB, Usuario, Rol, Carrito, Productos, Pedidos, ProductosCarrito, ProductosPedidos, Ofertas, RegistroHorarios };