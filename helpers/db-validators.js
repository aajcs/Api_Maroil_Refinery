const Role = require("../models/role");
const {
  Usuario,
  Categoria,
  Producto,
  Refineria,
  LineaCarga,
  Tanque,
  Bomba,
  Torre,
  Contrato,
  Contacto,
  Recepcion,
} = require("../models");

const esRoleValido = async (rol = "USER_ROLE") => {
  const existeRol = await Role.findOne({ rol });
  if (!existeRol) {
    throw new Error(`El rol ${rol} no está registrado en la BD`);
  }
};

const emailExiste = async (correo = "") => {
  // Verificar si el correo existe
  const existeEmail = await Usuario.findOne({ correo });
  if (existeEmail) {
    throw new Error(`El correo: ${correo}, ya está registrado`);
  }
};
const nitExiste = async (nit = "") => {
  // Verificar si el nit existe
  const nitExiste = await Refineria.findOne({ nit });
  if (nitExiste) {
    throw new Error(`El nit: ${nit}, ya está registrado`);
  }
};

const existeUsuarioPorId = async (id) => {
  // Verificar si el correo existe
  const existeUsuario = await Usuario.findById(id);
  if (!existeUsuario) {
    throw new Error(`El id no existe ${id}`);
  }
};

const existeRefineriaPorId = async (id) => {
  // Verificar si la refineria existe
  const existeRefineria = await Refineria.findById(id);
  if (!existeRefineria) {
    throw new Error(`El id no existe ${id}`);
  }
};

const existeLineaPorId = async (id) => {
  // Verificar si la linea existe
  const existeLinea = await LineaCarga.findById(id);
  if (!existeLinea) {
    throw new Error(`El id no existe ${id}`);
  }
};

const existeBombaPorId = async (id) => {
  // Verificar si la Bomba existe
  const existeBomba = await Bomba.findById(id);
  if (!existeBomba) {
    throw new Error(`El id no existe ${id}`);
  }
};
const existeTanquePorId = async (id) => {
  // Verificar si el Tanque existe
  const existeTanque = await Tanque.findById(id);
  if (!existeTanque) {
    throw new Error(`El id no existe ${id}`);
  }
};

const existeTorrePorId = async (id) => {
  // Verificar si torre existe
  const existeTorre = await Torre.findById(id);
  if (!existeTorre) {
    throw new Error(`El id no existe ${id}`);
  }
};

const existeContratoPorId = async (id) => {
  // Verificar si contrato existe
  const existeContrato = await Contrato.findById(id);
  if (!existeContrato) {
    throw new Error(`El id no existe ${id}`);
  }
};

const existeRecepcionPorId = async (id) => {
  // Verificar si la linea existe
  const existeRecepcion = await Recepcion.findById(id);
  if (!existeRecepcion) {
    throw new Error(`El id no existe ${id}`);
  }
};

const existeContactoPorId = async (id) => {
  // Verificar si contacto existe
  const existeContacto = await Contacto.findById(id);
  if (!existeContacto) {
    throw new Error(`El id no existe ${id}`);
  }
};
/**
 * Categorias
 */
const existeCategoriaPorId = async (id) => {
  // Verificar si el correo existe
  const existeCategoria = await Categoria.findById(id);
  if (!existeCategoria) {
    throw new Error(`El id no existe ${id}`);
  }
};

/**
 * Productos
 */
const existeProductoPorId = async (id) => {
  // Verificar si el correo existe
  const existeProducto = await Producto.findById(id);
  if (!existeProducto) {
    throw new Error(`El id no existe ${id}`);
  }
};
const existeRefinacionPorId = async (id) => {
  // Verificar si refinacion existe
  const existeRefinacion = await Refinacion.findById(id);
  if (!existeRefinacion) {
    throw new Error(`El id no existe ${id}`);
  }
};

/**
 * Validar colecciones permitidas
 */
const coleccionesPermitidas = (coleccion = "", colecciones = []) => {
  const incluida = colecciones.includes(coleccion);
  if (!incluida) {
    throw new Error(
      `La colección ${coleccion} no es permitida, ${colecciones}`
    );
  }
  return true;
};

module.exports = {
  esRoleValido,
  emailExiste,
  existeUsuarioPorId,
  existeCategoriaPorId,
  existeProductoPorId,
  coleccionesPermitidas,
  nitExiste,
  existeRefineriaPorId,
  existeLineaPorId,
  existeBombaPorId,
  existeTanquePorId,
  existeTorrePorId,
  existeContratoPorId,
  existeContactoPorId,
  existeRecepcionPorId,
  existeRefinacionPorId,
};
