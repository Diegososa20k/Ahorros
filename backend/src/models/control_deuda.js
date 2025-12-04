module.exports = (sequelize, DataTypes) => {
  const ControlDeuda = sequelize.define("ControlDeuda", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cantidad_total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    meses_diferidos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_limite: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
     pagado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    control_mensualidad: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    tableName: "control_deuda",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

    ControlDeuda.associate = function(models) {
    // En caso de que más adelante se relacione con otras tablas
    Ahorro.belongsTo(models.UbicacionDinero, {
      foreignKey: 'propietario_id',
      as: 'propietario'
    });

  };




  return ControlDeuda;
};
