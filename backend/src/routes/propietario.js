// backend/src/routes/propietario.js
const express = require('express');
const router = express.Router();
const { Propietario } = require('../models');

// GET todos los propietarios
router.get('/', async (req, res) => {
  try {
    const propietarios = await Propietario.findAll({ include: ['ubicacion'] });
    res.json(propietarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear propietario
router.post('/', async (req, res) => {
  try {
    const nuevo = await Propietario.create(req.body);
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
