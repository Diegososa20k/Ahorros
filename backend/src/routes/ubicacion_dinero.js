// backend/src/routes/ubicacion_dinero.js
const express = require('express');
const router = express.Router();
const { UbicacionDinero, Categoria } = require('../models');
const authMiddleware = require('../middleware/auth'); 

router.get('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const rows = await UbicacionDinero.findAll({
      where: { usuario_id: req.usuario.id }, // 🔹 Solo del usuario logueado
      include: [{ model: Categoria, as: 'categoria' }]
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const nueva = await UbicacionDinero.create({
      ...req.body,
      usuario_id: req.usuario.id  // 🔹 Asignamos el usuario automáticamente
    });
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id', authMiddleware.verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Verificamos que la ubicación pertenezca al usuario
    const ubicacion = await UbicacionDinero.findOne({ 
      where: { id, usuario_id: req.usuario.id }
    });

    if (!ubicacion) {
      return res.status(404).json({ error: "La ubicación no existe o no pertenece al usuario." });
    }

    await ubicacion.destroy();

    res.json({ success: true, message: "Ubicación eliminada correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
