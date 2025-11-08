// backend/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { sequelize } = require('./src/models'); // models/index.js exports sequelize
const ubicacionRouter = require('./src/routes/ubicacion_dinero');
const categoriaRouter = require('./src/routes/categoria');
const propietarioRouter = require('./src/routes/propietario');




const app = express();
app.use(cors());
app.use(bodyParser.json());

// rutas
app.use('/api/ubicacion_dinero', ubicacionRouter);
app.use('/api/categoria', categoriaRouter);
app.use('/api/propietario', propietarioRouter);

// sincronizar (solo en dev; cuidado en prod)
sequelize.sync() // no force ni alter salvo que quieras
  .then(() => console.log('📦 DB sincronizada'))
  .catch(err => console.error('❌ Error sincronizando DB', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
