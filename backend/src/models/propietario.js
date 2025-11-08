// backend/src/models/propietario.js
module.exports = (sequelize, DataTypes) => {
  const Propietario = sequelize.define('Propietario', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tieneCajitas: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'propietarios',
    timestamps: true
  });

  Propietario.associate = function(models) {
    Propietario.belongsTo(models.UbicacionDinero, { foreignKey: 'ubicacion_id', as: 'ubicacion' });
  };

  return Propietario;
};
