const express = require('express');
const router = express.Router();
const db = require('../models');
const propietario = require('../models/propietario');
const { ControlDeuda } = db;
const authMiddleware = require('../middleware/auth');
const usuario = require('../models/usuario');

// Crear deuda
router.post('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, cantidad_total, meses_diferidos, fecha_limite, propietario_id } = req.body;

    let mensualidades = [];

    // --------------------------
    // GENERAR MENSUALIDADES
    // --------------------------
    const cantidadPorMes = (cantidad_total / meses_diferidos).toFixed(2);

    let fechaBase = new Date(fecha_limite);

    for (let i = 1; i <= meses_diferidos; i++) {

      let fechaMensual = new Date(fechaBase);
      fechaMensual.setMonth(fechaBase.getMonth() + (i - 1));

      mensualidades.push({
        pagado_mensualidades: false,
        mensualidad: i,
        cantidad: Number(cantidadPorMes),
        fecha_pago: fechaMensual.toISOString().slice(0, 10),
        abono: 0,
        propietario_id: propietario_id
      });
    }

    // --------------------------
    // CREAR DEUDA EN DB
    //---------------------------
    const nuevaDeuda = await ControlDeuda.create({
      nombre,
      descripcion,
      cantidad_total,
      meses_diferidos,
      fecha_limite,
      control_mensualidad: mensualidades,
      usuario_id: req.usuario.id
    });

    res.json({ success: true, data: nuevaDeuda });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});





// Obtener todas las deudas
router.get('/', authMiddleware.verificarToken, async (req, res) => {
  try {
    const deudas = await ControlDeuda.findAll({
      where: { usuario_id: req.usuario.id },
      order: [['id', 'DESC']]
    });

    // Traer propietarios para nombrarlos sin hacer consultas repetidas
    const propietarios = await db.PropietarioUnico.findAll();
    const mapaProp = {};
    propietarios.forEach(p => mapaProp[p.id] = p.nombre);

    // Recorrer deudas y mensualidades
    const respuesta = deudas.map(d => {
      let mensualidades = d.control_mensualidad.map(m => ({
        ...m,
        propietario_nombre: mapaProp[m.propietario_id] || null
      }));

      return {
        ...d.toJSON(),
        control_mensualidad: mensualidades
      };
    });

    res.json(respuesta);

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


// Marcar deuda completa como pagada
router.put('/:id/pagar', authMiddleware.verificarToken, async (req, res) => {
  try {
    const deuda = await ControlDeuda.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id }
    });
    if (!deuda) return res.json({ success: false, message: "No existe o no pertenece al usuario" });

    deuda.pagado = req.body.pagado;
    await deuda.save();

    res.json({ success: true, data: deuda });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Eliminar deuda
router.delete('/:id', authMiddleware.verificarToken, async (req, res) => {
  try {
    const rows = await ControlDeuda.destroy({
      where: { id: req.params.id, usuario_id: req.usuario.id }
    });

    if (rows === 0)
      return res.json({ success: false, message: "No existe o no pertenece al usuario" });

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Pagar mensualidad
router.put('/:id/pagar_mensualidad', authMiddleware.verificarToken, async (req, res) => {
  try {
    const { mensualidad, pagado } = req.body;
    const deuda = await ControlDeuda.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id }
    });
    if (!deuda) return res.json({ success: false, message: "No existe o no pertenece al usuario" });

    let mens = deuda.control_mensualidad;
    const index = mens.findIndex(m => m.mensualidad == mensualidad);
    if (index === -1) return res.json({ success: false, message: "Mensualidad no encontrada" });

    mens[index].pagado_mensualidades = pagado;
    deuda.control_mensualidad = mens;
    deuda.changed("control_mensualidad", true);

    deuda.pagado = mens.every(m => m.pagado_mensualidades === true);
    deuda.changed("pagado", true);

    await deuda.save();
    return res.json({ success: true, data: deuda });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Abonar mensualidad
router.put('/:id/abonar', authMiddleware.verificarToken, async (req, res) => {
  try {
    const { mensualidad, cantidad } = req.body;
    const deuda = await ControlDeuda.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id }
    });
    if (!deuda) return res.json({ success: false, message: "No existe o no pertenece al usuario" });

    let mens = deuda.control_mensualidad;
    const index = mens.findIndex(m => m.mensualidad == mensualidad);
    if (index === -1) return res.json({ success: false, message: "Mensualidad no encontrada" });

    mens[index].abono = (mens[index].abono || 0) + Number(cantidad);
    deuda.control_mensualidad = mens;
    deuda.changed("control_mensualidad", true);

    await deuda.save();
    res.json({ success: true, data: deuda });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


module.exports = router;