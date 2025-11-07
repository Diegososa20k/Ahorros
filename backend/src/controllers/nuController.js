const Nu = require('../models/nu');

// Obtener todos los registros
exports.getAll = async (req, res) => {
  try {
    const registros = await Nu.findAll();
    res.json(registros);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registros', error });
  }
};

// Crear un nuevo registro
exports.create = async (req, res) => {
  try {
    const { nombre, usuario } = req.body;
    const nuevo = await Nu.create({ nombre, usuario });
    res.json(nuevo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear registro', error });
  }
};
