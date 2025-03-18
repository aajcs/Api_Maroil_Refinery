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
const Historial = require("./historial");
const Costo = require("./costo");
const RefinacionSalida = require("./refinacionSalida");
const Balance = require("./balance");
const BalanceBunker = require("./bunker/balanceBunker");
const Barcaza = require("./bunker/barcaza");
const Bunker = require("./bunker/bunker");
const ChequeoCalidadBunker = require("./bunker/chequeoCalidadBunker");
const ChequeoCantidadBunker = require("./bunker/chequeoCantidadBunker");
const LineaCargaBunker = require("./bunker/lineaCargaBunker");
const ProductoBunker = require("./bunker/productoBunker");
const ContratoBunker = require("./bunker/contratoBunker");
const ContactoBunker = require("./bunker/contactoBunker");
const RecepcionBunker = require("./bunker/recepcionBunker");
const HistorialBunker = require("./bunker/historialBunker");
const CostoBunker = require("./bunker/costoBunker")


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
  Historial,
  Costo,
  RefinacionSalida,
  Balance,
  BalanceBunker,
  Barcaza,
  ChequeoCalidadBunker,
  ChequeoCantidadBunker,
  LineaCargaBunker,
  ProductoBunker,
  ContratoBunker,
  ContactoBunker,
  RecepcionBunker,
  HistorialBunker,
  CostoBunker,

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
