const express = require('express');
const router = express.Router();
const nuController = require('../controllers/nuController');

// Obtener todos los registros
router.get('/', nuController.getAll);

// Crear un nuevo registro
router.post('/', nuController.create);

module.exports = router;
