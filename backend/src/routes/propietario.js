// backend/src/routes/propietario.js
const express = require('express');
const router = express.Router();
const { Propietario, PropietarioUnico, UbicacionDinero, Categoria } = require('../models');
const authMiddleware = require('../middleware/auth'); 

// GET todos los propietarios con relaciones
router.get('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const propietarios = await Propietario.findAll({
      where: { usuario_id: req.usuario.id }, // 🔹 Filtramos por usuario
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
router.post('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const nuevo = await Propietario.create({
      ...req.body,
      usuario_id: req.usuario.id  // 🔹 Asignamos el usuario logueado
    });
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.delete('/:id', authMiddleware.verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Verificamos que el propietario pertenezca al usuario
    const propietario = await Propietario.findOne({
      where: { id, usuario_id: req.usuario.id }
    });

    if (!propietario) {
      return res.status(404).json({ error: 'Propietario no encontrado o no pertenece al usuario' });
    }

    await propietario.destroy();
    res.json({ message: 'Propietario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
