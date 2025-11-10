// backend/src/models/donde_ahorrar.js
module.exports = (sequelize, DataTypes) => {
  const DondeAhorrar = sequelize.define('DondeAhorrar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'donde_ahorrar',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DondeAhorrar.associate = function(models) {
    // En caso de que más adelante se relacione con otras tablas
  };

  return DondeAhorrar;
};
