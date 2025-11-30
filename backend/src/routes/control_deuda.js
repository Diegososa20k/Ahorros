const express = require('express');
const router = express.Router();
const db = require('../models');
const { ControlDeuda } = db;

// Crear deuda
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, cantidad_total, meses_diferidos, fecha_limite } = req.body;

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
        abono: 0
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
      control_mensualidad: mensualidades
    });

    res.json({ success: true, data: nuevaDeuda });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


module.exports = router;


// Obtener todas las deudas
router.get('/', async (req, res) => {
  try {
    const deudas = await ControlDeuda.findAll({
      order: [['id', 'DESC']]
    });

    res.json(deudas);

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.put('/:id/pagar', async (req, res) => {
  try {
    const deuda = await ControlDeuda.findByPk(req.params.id);
    if (!deuda) return res.json({ success: false, message: "No existe" });

    deuda.pagado = req.body.pagado;
    await deuda.save();

    res.json({ success: true, data: deuda });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const rows = await ControlDeuda.destroy({
      where: { id: req.params.id }
    });

    if (rows === 0)
      return res.json({ success: false, message: "No existe" });

    res.json({ success: true });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


router.put('/:id/pagar_mensualidad', async (req, res) => {
  try {
    const { mensualidad, pagado } = req.body;
    const deuda = await ControlDeuda.findByPk(req.params.id);

    if (!deuda) {
      return res.json({ success: false, message: "No existe" });
    }

    let mens = deuda.control_mensualidad;

    // Buscar mensualidad por número
    const index = mens.findIndex(m => m.mensualidad == mensualidad);
    if (index === -1) {
      return res.json({ success: false, message: "No encontrada" });
    }

    // Actualizar la mensualidad
    mens[index].pagado_mensualidades = pagado;

    // Guardar cambios en JSONB
    deuda.control_mensualidad = mens;
    deuda.changed("control_mensualidad", true);

    // 🔥 NUEVO: marcar deuda como pagada si todas las mensualidades están pagadas
    const todasPagadas = mens.every(m => m.pagado_mensualidades === true);
    deuda.pagado = todasPagadas;
    deuda.changed("pagado", true);

    await deuda.save();

    return res.json({ success: true, data: deuda });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.put('/:id/abonar', async (req, res) => {
  try {
    const { mensualidad, cantidad } = req.body;

    const deuda = await ControlDeuda.findByPk(req.params.id);
    if (!deuda) return res.json({ success: false, message: "No existe" });

    let mens = deuda.control_mensualidad;

    // Buscar mensualidad
    const index = mens.findIndex(m => m.mensualidad == mensualidad);
    if (index === -1)
      return res.json({ success: false, message: "Mensualidad no encontrada" });

    // Aplicar abono
    mens[index].abono = (mens[index].abono || 0) + Number(cantidad);

    // Guardar JSONB
    deuda.control_mensualidad = mens;
    deuda.changed("control_mensualidad", true);

    await deuda.save();

    res.json({ success: true, data: deuda });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

