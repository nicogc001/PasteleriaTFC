const EmailLog = db.define(
  "EmailLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tipo: { type: DataTypes.STRING, allowNull: false },
    entidadId: { type: DataTypes.INTEGER, allowNull: false },
    to: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.STRING, defaultValue: "pending" },
    messageId: { type: DataTypes.STRING, allowNull: true },
    error: { type: DataTypes.TEXT, allowNull: true },
    html: { type: DataTypes.TEXT, allowNull: true },
    text: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "EmailLogs",
    timestamps: true,
  }
);
