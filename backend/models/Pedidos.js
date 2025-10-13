const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Usuario = require("./Usuario");
const Direccion = require("./Direccion");
// const ProductosPedidos = require('./ProductosPedidos'); // ← mejor asociar en models/index si hay ciclos

const Pedido = db.define(
  "Pedido",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Usuario, key: "id" },
      onDelete: "CASCADE",
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    total: { type: DataTypes.FLOAT, allowNull: false },
    estado: {
      type: DataTypes.STRING, // o ENUM(...) si prefieres
      allowNull: false,
      defaultValue: "pendiente_pago",
    },
    metodoPago: { type: DataTypes.STRING, allowNull: true },
    tipoEntrega: { type: DataTypes.STRING, allowNull: false },
    tienda: { type: DataTypes.STRING, allowNull: true },
    aprobadorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Usuario, key: "id" },
    },
    aprobadoPorEmpleado: { type: DataTypes.BOOLEAN, defaultValue: false },
    segundoAprobadorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Usuario, key: "id" },
    },
    aprobadoPorAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    fechaEntrega: { type: DataTypes.DATEONLY, allowNull: false },
    direccionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Direccion, key: "id" },
    },
  },
  {
    tableName: "Pedidos",
    timestamps: false,
  }
);

// Relaciones
Usuario.hasMany(Pedido, { foreignKey: "usuarioId", onDelete: "CASCADE" });
// clave: alias 'cliente'
Pedido.belongsTo(Usuario, { as: "cliente", foreignKey: "usuarioId" });

// Aprobadores
Usuario.hasMany(Pedido, {
  foreignKey: "aprobadorId",
  as: "AprobacionesEmpleado",
});
Usuario.hasMany(Pedido, {
  foreignKey: "segundoAprobadorId",
  as: "AprobacionesAdmin",
});
Pedido.belongsTo(Usuario, {
  foreignKey: "aprobadorId",
  as: "AprobadorEmpleado",
});
Pedido.belongsTo(Usuario, {
  foreignKey: "segundoAprobadorId",
  as: "AprobadorAdmin",
});

// Dirección
Pedido.belongsTo(Direccion, { foreignKey: "direccionId" });
Direccion.hasMany(Pedido, { foreignKey: "direccionId" });

// Items del pedido (opcional; mejor en models/index.js si hay ciclos)
// Pedido.hasMany(ProductosPedidos, { as: 'items', foreignKey: 'pedidoId' });

module.exports = Pedido;
