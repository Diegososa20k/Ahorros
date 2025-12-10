const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario } = require("../models");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ where: { email } });

    if (!user) return res.status(400).json({ ok: false, err: "Usuario no encontrado" });

    // bcrypt compara con password_hash
    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) return res.status(400).json({ ok: false, err: "Contraseña incorrecta" });

    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      "CLAVE_SUPER_SECRETA",
      { expiresIn: "8h" }
    );

    // Devolver usuario y token
    return res.json({ ok: true, usuario: user, token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, err: "Error del servidor" });
  }
});



// 🆕 RUTA DE REGISTRO
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar que vengan todos los campos
    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, err: "Faltan datos requeridos" });
    }

    // Verificar si el email ya existe
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(400).json({ ok: false, err: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const password_hash = bcrypt.hashSync(password, 10);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password_hash,
      rol: "usuario" // rol por defecto
    });

    return res.json({ 
      ok: true, 
      msg: "Usuario registrado exitosamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, err: "Error del servidor" });
  }
});


module.exports = router;
