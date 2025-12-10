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
const Ahorro = require('./ahorro')(sequelize, DataTypes); // 🔹 <--- NUEVO
const ControlDeuda = require('./control_deuda')(sequelize, DataTypes); // 🔹 <--- NUEVO
const Usuario = require('./usuario')(sequelize, DataTypes);


// === Asignar al objeto db ===
db.Categoria = Categoria;
db.UbicacionDinero = UbicacionDinero;
db.Propietario = Propietario;
db.PropietarioUnico = PropietarioUnico;
db.Ahorro = Ahorro; // 🔹 <--- NUEVO
db.ControlDeuda = ControlDeuda; // 🔹 <--- NUEVO
db.Usuario = Usuario;


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

// 4️⃣ Ahorro pertenece a Ubicación y PropietarioUnico 🔹 NUEVAS RELACIONES
Ahorro.belongsTo(UbicacionDinero, {
  foreignKey: 'ubicacion_id',
  as: 'ubicacion',
});
UbicacionDinero.hasMany(Ahorro, {
  foreignKey: 'ubicacion_id',
  as: 'ahorros',
});

Ahorro.belongsTo(PropietarioUnico, {
  foreignKey: 'propietario_id',
  as: 'propietario',
});
PropietarioUnico.hasMany(Ahorro, {
  foreignKey: 'propietario_id',
  as: 'ahorros',
});

// === Exportación ===
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
