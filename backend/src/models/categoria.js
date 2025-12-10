module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    usuario_id: {                    // <-- NUEVO CAMPO
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    tableName: 'categoria',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  
  Categoria.associate = function(models) {

    Categoria.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });

  };

  return Categoria;
};
