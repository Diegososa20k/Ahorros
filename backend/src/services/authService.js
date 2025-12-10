const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

module.exports = {
  async registrar(data) {
    const hashed = bcrypt.hashSync(data.password, 10);

    return await Usuario.create({
      nombre: data.nombre,
      email: data.email,
      password: hashed,
      rol: data.rol || 'usuario'
    });
  },

  async login(email, password) {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) throw new Error('Usuario no encontrado');

    const valid = bcrypt.compareSync(password, usuario.password);
    if (!valid) throw new Error('Contraseña incorrecta');

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      "CLAVE_SUPER_SECRETA",
      { expiresIn: "8h" }
    );

    return { token, usuario };
  }
};
