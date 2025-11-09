// backend/src/routes/propietario.js
const express = require('express');
const router = express.Router();
const { Propietario, PropietarioUnico, UbicacionDinero, Categoria } = require('../models');

// GET todos los propietarios con relaciones
router.get('/', async (req, res) => {
  try {
    const propietarios = await Propietario.findAll({
      include: [
        { model: PropietarioUnico, as: 'propietario_unico', attributes: ['nombre'] },
        { 
          model: UbicacionDinero,
          as: 'ubicacion',
          attributes: ['nombre'],
          include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }]
        }
      ]
    });
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


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const propietario = await Propietario.findByPk(id);
    if (!propietario) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }
    await propietario.destroy();
    res.json({ message: 'Propietario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
