const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const sequelize = require('./src/config/database'); // 👈 Importa conexión

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Ahorros funcionando 🚀' });
});

// 👇 NUEVO: importar y usar rutas de nu
const nuRoutes = require('./src/routes/nuRoutes');
app.use('/api/nu', nuRoutes);








// Sincronizar base de datos (opcional, solo para desarrollo)
sequelize.sync()
  .then(() => console.log('📦 Modelos sincronizados con la base de datos'))
  .catch(err => console.error('❌ Error al sincronizar modelos:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
