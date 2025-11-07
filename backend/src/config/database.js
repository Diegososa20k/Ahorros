const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Leer config.json
const configPath = path.join(__dirname, '../../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8')).database;

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    dialect: config.DB_DIALECT,
    logging: false, // opcional: silencia logs SQL
  }
);

// Probar conexión (opcional)
sequelize.authenticate()
  .then(() => console.log('✅ Conexión a la base de datos establecida'))
  .catch(err => console.error('❌ Error de conexión a la base de datos:', err));

module.exports = sequelize;
