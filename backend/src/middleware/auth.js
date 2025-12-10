const jwt = require("jsonwebtoken");

module.exports = {
  verificarToken(req, res, next) {
    const token = req.headers["x-access-token"];

    if (!token) {
      return res.status(401).json({ ok: false, msg: "Token requerido" });
    }

    try {
      const decoded = jwt.verify(token, "CLAVE_SUPER_SECRETA");
      req.usuario = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ ok: false, msg: "Token inválido" });
    }
  },

  soloAdmin(req, res, next) {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ ok: false, msg: "Solo Admin" });
    }
    next();
  }
};
