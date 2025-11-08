module.exports = (sequelize, DataTypes) => {
  const UbicacionDinero = sequelize.define('UbicacionDinero', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    categoria_id: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'ubicacion_dinero',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return UbicacionDinero;
};
