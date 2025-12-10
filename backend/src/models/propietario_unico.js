// backend/src/models/propietario_unico.js
module.exports = (sequelize, DataTypes) => {
  const PropietarioUnico = sequelize.define('PropietarioUnico', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    usuario_id: {                    // <-- NUEVO CAMPO
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Si necesitas más campos agrégalos aquí
  }, {
    tableName: 'propietario', // <- cambia aquí si tu tabla se llama distinto ('propietario_unico' o 'propietarios')
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // No hay asociaciones extras (tabla independiente)
  PropietarioUnico.associate = function(models) {
    // si en el futuro relacionas algo, lo pones aquí
    PropietarioUnico.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  };

  return PropietarioUnico;
};
