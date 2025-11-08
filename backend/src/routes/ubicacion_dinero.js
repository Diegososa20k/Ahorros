// backend/src/routes/ubicacion_dinero.js
const express = require('express');
const router = express.Router();
const { UbicacionDinero, Categoria } = require('../models');

router.get('/', async (req, res) => {
  try {
    const rows = await UbicacionDinero.findAll({
      include: [{ model: Categoria, as: 'categoria' }]
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const nueva = await UbicacionDinero.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
