const express = require('express');
const router = express.Router();
const db = require('../models'); // 👈 importa toda la base de datos
const { PropietarioUnico, Propietario, UbicacionDinero } = db;


// GET /api/propietario_unico  -> lista todos
router.get('/', async (req, res) => {
  try {
    const rows = await PropietarioUnico.findAll({ order: [['id','DESC']] });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/propietario_unico  -> crear (payload: { nombre: "..." })
router.post('/', async (req, res) => {
  try {
    const nueva = await PropietarioUnico.create({ nombre: req.body.nombre });
    res.status(201).json(nueva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Obtener ubicaciones asociadas a un propietario_unico
router.get('/:id/ubicaciones', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar ubicaciones asociadas a este propietario único
    const ubicaciones = await db.Propietario.findAll({
      where: { propietario_id: id },
      include: [
        {
          model: db.UbicacionDinero,
          as: 'ubicacion',
          attributes: ['id', 'nombre']
        }
      ]
    });

    // Extraer solo ubicaciones únicas
    const ubicacionesUnicas = [];
    const ids = new Set();
    ubicaciones.forEach(u => {
      if (u.ubicacion && !ids.has(u.ubicacion.id)) {
        ids.add(u.ubicacion.id);
        ubicacionesUnicas.push(u.ubicacion);
      }
    });

    res.json({ success: true, data: ubicacionesUnicas });
  } catch (error) {
    console.error('Error al obtener ubicaciones del propietario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ubicaciones' });
  }
});


// Obtener cajitas/subcuentas de una ubicación específica de un propietario
router.get('/:id/ubicaciones/:ubicacionId/cajitas', async (req, res) => {
  try {
    const { id, ubicacionId } = req.params;

    const registros = await db.Propietario.findAll({
      where: {
        propietario_id: id,
        ubicacion_id: ubicacionId
      },
      attributes: ['nombre_cajita_subcuenta']
    });

    const cajitas = registros
      .map(r => r.nombre_cajita_subcuenta)
      .filter(c => c && c.trim() !== '');

    if (cajitas.length === 0) {
      cajitas.push('No tiene');
    }

    res.json({ success: true, data: cajitas });
  } catch (error) {
    console.error('Error al obtener cajitas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cajitas' });
  }
});


module.exports = router;


