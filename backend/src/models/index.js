'use strict';

const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// === Importar modelos ===
const Categoria = require('./categoria')(sequelize, DataTypes);
const UbicacionDinero = require('./ubicacion_dinero')(sequelize, DataTypes);
const Propietario = require('./propietario')(sequelize, DataTypes);
const PropietarioUnico = require('./propietario_unico')(sequelize, DataTypes);

// === Asignar al objeto db ===
db.Categoria = Categoria;
db.UbicacionDinero = UbicacionDinero;
db.Propietario = Propietario;
db.PropietarioUnico = PropietarioUnico;

// === Relaciones ===

// 1️⃣ Ubicación pertenece a Categoría
UbicacionDinero.belongsTo(Categoria, {
  foreignKey: 'categoria_id',
  as: 'categoria',
});
Categoria.hasMany(UbicacionDinero, {
  foreignKey: 'categoria_id',
  as: 'ubicaciones',
});

// 2️⃣ Propietario pertenece a Ubicación del Dinero
Propietario.belongsTo(UbicacionDinero, {
  foreignKey: 'ubicacion_id',
  as: 'ubicacion',
});
UbicacionDinero.hasMany(Propietario, {
  foreignKey: 'ubicacion_id',
  as: 'propietarios',
});

// 3️⃣ Propietario pertenece a PropietarioUnico (nombre del propietario)
Propietario.belongsTo(PropietarioUnico, {
  foreignKey: 'propietario_id',
  as: 'propietario_unico',
});
PropietarioUnico.hasMany(Propietario, {
  foreignKey: 'propietario_id',
  as: 'propietarios',
});

// === Exportación ===
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
