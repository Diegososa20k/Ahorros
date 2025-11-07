const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Nu = sequelize.define('nu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  usuario: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'nu',
  timestamps: false // ya tienes tus columnas cread_at / updated_at manuales
});

module.exports = Nu;
