// backend/src/models/ahorro.js
module.exports = (sequelize, DataTypes) => {
  const Ahorro = sequelize.define('Ahorro', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cantidad_ahorro: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    fecha_ahorro: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ubicacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    propietario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cajita_subcuenta: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    es_transferencia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'ahorro',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Ahorro.associate = function(models) {
    // Relación con UbicacionDinero
    Ahorro.belongsTo(models.UbicacionDinero, {
      foreignKey: 'ubicacion_id',
      as: 'ubicacion'
    });

    // Relación con Propietario (propietario_unico)
    // En vez de PropietarioUnico:
    Ahorro.belongsTo(models.Propietario, {
        foreignKey: 'propietario_id',
        as: 'propietario'
    });

  };

  return Ahorro;
};
