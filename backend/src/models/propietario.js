// backend/src/models/propietario.js
module.exports = (sequelize, DataTypes) => {
  const Propietario = sequelize.define('Propietario', {
    tieneCajitas: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'tienecajitas'
    },
    ubicacion_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ubicacion_dinero',
        key: 'id'
      }
    },
    propietario_id: { // 🔹 Nueva columna para la relación con propietario_unico
      type: DataTypes.INTEGER,
      references: {
        model: 'propietario',
        key: 'id'
      }
    },
    nombre_cajita_subcuenta: { // 🔹 nuevo campo
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'propietarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Propietario.associate = function(models) {
    // 🔹 Relación con Ubicación del Dinero
    Propietario.belongsTo(models.UbicacionDinero, { 
      foreignKey: 'ubicacion_id', 
      as: 'ubicacion' 
    });

    // 🔹 Relación con PropietarioUnico (nombre del propietario)
    Propietario.belongsTo(models.PropietarioUnico, { 
      foreignKey: 'propietario_id',
      as: 'propietario_unico' 
    });
  };

  return Propietario;
};
