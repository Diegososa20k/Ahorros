// backend/src/routes/categoria.js
const express = require('express');
const router = express.Router();
const { Categoria } = require('../models');
const authMiddleware = require('../middleware/auth');
const usuario = require('../models/usuario');

router.get('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { usuario_id: req.usuario.id },
    });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const nueva = await Categoria.create({
      ...req.body,
      usuario_id: req.usuario.id
    });
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.put('/:id', authMiddleware.verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findOne({
      where: {
        id,
        usuario_id: req.usuario.id
      }
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await categoria.update(req.body);

    res.json(categoria);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id', authMiddleware.verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findOne({
      where: {
        id,
        usuario_id: req.usuario.id
      }
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await categoria.destroy();
    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
