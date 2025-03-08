const Bomba = require("./bomba");
const Categoria = require("./categoria");
const LineaCarga = require("./lineaCarga");
const Producto = require("./producto");
const Refineria = require("./refineria");
const Role = require("./role");
const Server = require("./server");
const Usuario = require("./usuario");
const Tanque = require("./tanque");
const Torre = require("./torre");
const Contrato = require("./contrato");
const Contacto = require("./contacto");
const Recepcion = require("./recepcion");
const Refinacion = require("./refinacion");
const Despacho = require("./despacho");
const ChequeoCalidad = require("./chequeoCalidad");
const ChequeoCantidad = require("./chequeoCantidad");
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
  LineaCarga,
  Refineria,
  Bomba,
  Tanque,
  Torre,
  Contrato,
  Contacto,
  Recepcion,
  Refinacion,
  ChequeoCalidad,
  ChequeoCantidad,

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
