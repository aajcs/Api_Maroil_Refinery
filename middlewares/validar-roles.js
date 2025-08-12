const { response } = require("express");

const ROLES = [
  "LECTURA_ROLE",
  "USER_ROLE",
  "OPERADOR_ROLE",
  "ADMIN_ROLE",
  "SUPER_ADMIN_ROLE",
];

const checkRole = (requiredRole) => {
  return (req, res = response, next) => {
    if (!req.usuario) {
      return res.status(500).json({
        msg: "Se quiere verificar el role sin validar el token primero",
      });
    }

    const { rol, nombre } = req.usuario;
    const userRoleIndex = ROLES.indexOf(rol);
    const requiredRoleIndex = ROLES.indexOf(requiredRole);

    if (userRoleIndex === -1) {
      return res.status(401).json({
        msg: `${nombre} tiene un rol no válido`,
      });
    }

    // Permite acceso si el rol del usuario es igual o superior al requerido
    if (userRoleIndex < requiredRoleIndex) {
      return res.status(401).json({
        msg: `${nombre} no tiene permisos suficientes - Se requiere al menos ${requiredRole}`,
      });
    }

    next();
  };
};

const esSuperAdminRole = checkRole("SUPERADMIN_ROLE");
const esAdminRole = checkRole("ADMIN_ROLE");
const esOperadorRole = checkRole("OPERADOR_ROLE");
const esUserRole = checkRole("USER_ROLE");
const esLecturaRole = checkRole("LECTURA_ROLE");

const tieneRole = (...roles) => {
  return (req, res = response, next) => {
    if (!req.usuario) {
      return res.status(500).json({
        msg: "Se quiere verificar el role sin validar el token primero",
      });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(401).json({
        msg: `El servicio requiere uno de estos roles ${roles}`,
      });
    }

    next();
  };
};

module.exports = {
  esSuperAdminRole,
  esAdminRole,
  esOperadorRole,
  esUserRole,
  esLecturaRole,
  tieneRole,
};
