// backend/src/routes/propietario_unico.js
const express = require('express');
const router = express.Router();
const { PropietarioUnico } = require('../models'); // asegúrate de exportarlo en models/index.js

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

module.exports = router;
