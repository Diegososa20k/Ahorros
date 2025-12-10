module.exports = (sequelize, DataTypes) => {
  const UbicacionDinero = sequelize.define('UbicacionDinero', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    categoria_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_id: {                    // <-- NUEVO CAMPO
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    tableName: 'ubicacion_dinero',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  UbicacionDinero.associate = function(models) {
    
    UbicacionDinero.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  };

  return UbicacionDinero;
};
