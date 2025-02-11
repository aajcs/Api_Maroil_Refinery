const Bomba = require("./bomba");
const Categoria = require("./categoria");
const Linea_carga = require("./linea_carga");
const Producto = require("./producto");
const Refineria = require("./refineria");
const Role = require("./role");
const Server = require("./server");
const Usuario = require("./usuario");
const Tanque = require("./tanque");
const Torre = require("./torre");
const Contrato = require("./contrato");
const Contrato_items = require("./contrato_items");
const Contacto = require("./contacto");
const Recepcion = require("./recepcion");
const Refinacion = require("./refinacion");
const Despacho = require("./despacho");
/*const contactos = require ('./contactos');
const bombas = require('./bombas');
const inspeccion_tanque = require('./inspeccion_tanque');
const recepcion = require('./recepcion');
const tanque = require('./tanque');
const refineria = require('./refineria');
const lotes_producto = require('./lotes_producto');
const linea_carga = require('./linea_carga');*/

module.exports = {
  Categoria,
  Producto,
  Role,
  Server,
  Usuario,
  Linea_carga,
  Refineria,
  Bomba,
  Tanque,
  Torre,
  Contrato,
  Contacto,
  Recepcion,
  Refinacion,
  Contrato_items,
  /*contactos,
    bombas,
    inspeccion_tanque,
    despacho,
    recepcion,
    tanque,
    refineria,
    lotes_producto,
    linea_carga, */
};
