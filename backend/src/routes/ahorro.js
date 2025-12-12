const express = require('express');
const router = express.Router();
const db = require('../models');
const { Ahorro, UbicacionDinero, PropietarioUnico } = db;
const authMiddleware = require('../middleware/auth'); // 🔹 Importa tu middleware


// // Obtener todos los ahorros
// router.get('/', authMiddleware.verificarToken, async (req, res) => {
//   try {
//     const lista = await Ahorro.findAll({
//       include: [
//         {
//           model: UbicacionDinero,
//           as: 'ubicacion',
//           attributes: ['id', 'nombre']
//         },
//         {
//           model: PropietarioUnico,
//           as: 'propietario',
//           attributes: ['id', 'nombre']
//         }
//       ],
//       order: [['fecha_ahorro', 'DESC']]
//     });

//     res.json({ success: true, data: lista });
//   } catch (error) {
//     console.error('Error al listar ahorros:', error);
//     res.status(500).json({ success: false, message: 'Error al obtener la lista' });
//   }
// });

// // Crear un nuevo ahorro
// router.post('/', authMiddleware.verificarToken, async (req, res) => {
//   try {
//     const {
//       cantidad_ahorro,
//       fecha_ahorro,
//       descripcion,
//       ubicacion_id,
//       propietario_id,
//       cajita_subcuenta,
//       es_transferencia   // 👈 AGREGARLO
//     } = req.body;


//     if (!cantidad_ahorro || !fecha_ahorro || !ubicacion_id || !propietario_id) {
//       return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
//     }

//     const nuevo = await Ahorro.create({
//       cantidad_ahorro,
//       fecha_ahorro,
//       descripcion,
//       ubicacion_id,
//       propietario_id,
//       cajita_subcuenta,
//       es_transferencia   // 👈 GUARDARLO
//     });

//     res.json({ success: true, data: nuevo });
//   } catch (error) {
//     console.error('Error al crear ahorro:', error);
//     res.status(500).json({ success: false, message: 'Error al crear registro' });
//   }
// });

// // Eliminar un ahorro
// router.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const eliminado = await Ahorro.destroy({ where: { id } });

//     if (!eliminado) {
//       return res.status(404).json({ success: false, message: 'Ahorro no encontrado' });
//     }

//     res.json({ success: true, message: 'Eliminado correctamente' });
//   } catch (error) {
//     console.error('Error al eliminar ahorro:', error);
//     res.status(500).json({ success: false, message: 'Error al eliminar' });
//   }
// });


// Obtener todos los ahorros
router.get('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const lista = await Ahorro.findAll({
  where: { usuario_id: req.usuario.id },  // 🔹 Solo los ahorros del usuario logueado
  include: [
    {
      model: UbicacionDinero,
      as: 'ubicacion',
      attributes: ['id', 'nombre']
    },
    {
      model: PropietarioUnico,
      as: 'propietario',
      attributes: ['id', 'nombre']
    }
  ],
  order: [['fecha_ahorro', 'DESC']]
});


    res.json({ success: true, data: lista });
  } catch (error) {
    console.error('Error al listar ahorros:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la lista' });
  }
});



// Eliminar un ahorro
router.delete('/:id', authMiddleware.verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Ahorro.destroy({
  where: {
    id,
    usuario_id: req.usuario.id   // 🔹 Solo puede eliminar sus propios registros
  }
});


    if (!eliminado) {
      return res.status(404).json({ success: false, message: 'Ahorro no encontrado' });
    }

    res.json({ success: true, message: 'Eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ahorro:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar' });
  }
});


// Crear un nuevo ahorro
router.post('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const {
      cantidad_ahorro,
      fecha_ahorro,
      descripcion,
      ubicacion_id,
      propietario_id,
      cajita_subcuenta,
      es_transferencia
    } = req.body;

    if (!cantidad_ahorro || !fecha_ahorro || !ubicacion_id || !propietario_id) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const nuevo = await Ahorro.create({
      cantidad_ahorro,
      fecha_ahorro,
      descripcion,
      ubicacion_id,
      propietario_id,
      cajita_subcuenta,
      es_transferencia,
      usuario_id: req.usuario.id   // 🔹 Asigna automáticamente el usuario logueado
    });

    res.json({ success: true, data: nuevo });
  } catch (error) {
    console.error('Error al crear ahorro:', error);
    res.status(500).json({ success: false, message: 'Error al crear registro' });
  }
});




module.exports = router;
