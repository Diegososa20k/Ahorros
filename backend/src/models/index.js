'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // usamos tu conexión desde config.json

const basename = path.basename(__filename);
const db = {};

// Importamos manualmente los modelos (evitamos la carga automática que está causando el error)
const Categoria = require('./categoria')(sequelize, DataTypes);
const UbicacionDinero = require('./ubicacion_dinero')(sequelize, DataTypes);

// Guardamos en el objeto db
db.Categoria = Categoria;
db.UbicacionDinero = UbicacionDinero;

// Relaciones
UbicacionDinero.belongsTo(Categoria, {
  foreignKey: 'categoria_id',
  as: 'categoria',
});

Categoria.hasMany(UbicacionDinero, {
  foreignKey: 'categoria_id',
  as: 'ubicaciones',
});

// Exportamos
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
