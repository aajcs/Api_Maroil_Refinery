const Balance = require("./balance");
const BalanceBunker = require("./bunker/balanceBunker");
const Barcaza = require("./bunker/barcaza");
const Bomba = require("./bomba");
const Bunker = require("./bunker/bunker");
const Categoria = require("./categoria");
const ChequeoCalidad = require("./chequeoCalidad");
const ChequeoCalidadBunker = require("./bunker/chequeoCalidadBunker");
const ChequeoCantidad = require("./chequeoCantidad");
const ChequeoCantidadBunker = require("./bunker/chequeoCantidadBunker");
const Contacto = require("./contacto");
const ContactoBunker = require("./bunker/contactoBunker");
const Contrato = require("./contrato");
const ContratoBunker = require("./bunker/contratoBunker");
const Costo = require("./costo");
const CostoBunker = require("./bunker/costoBunker");
const Despacho = require("./despachoviejo");
const Historial = require("./historial");
const HistorialBunker = require("./bunker/historialBunker");
const LineaCarga = require("./lineaCarga");
const LineaCargaBunker = require("./bunker/lineaCargaBunker");
const Producto = require("./producto");
const ProductoBunker = require("./bunker/productoBunker");
const Recepcion = require("./recepcion");
const RecepcionBunker = require("./bunker/recepcionBunker");
const Refineria = require("./refineria");
const Refinacion = require("./refinacion");
const RefinacionSalida = require("./refinacionSalida");
const Role = require("./role");
const Server = require("./server");
const Simulacion = require("./simulacion");
const Tanque = require("./tanque");
const TipoProducto = require("./tipoProducto");
const Torre = require("./torre");
const Usuario = require("./usuario");

/*const contactos = require ('./contactos');
const bombas = require('./bombas');
const inspeccion_tanque = require('./inspeccion_tanque');
const recepcion = require('./recepcion');
const tanque = require('./tanque');
const refineria = require('./refineria');
const lotes_producto = require('./lotes_producto');
const linea_carga = require('./linea_carga');*/

module.exports = {
  Balance,
  BalanceBunker,
  Barcaza,
  Bomba,
  Categoria,
  ChequeoCalidad,
  ChequeoCalidadBunker,
  ChequeoCantidad,
  ChequeoCantidadBunker,
  Contacto,
  ContactoBunker,
  Contrato,
  ContratoBunker,
  Costo,
  CostoBunker,
  Despacho,
  Historial,
  HistorialBunker,
  LineaCarga,
  LineaCargaBunker,
  Producto,
  ProductoBunker,
  Recepcion,
  RecepcionBunker,
  Refinacion,
  RefinacionSalida,
  Role,
  Server,
  Simulacion,
  Tanque,
  TipoProducto,
  Torre,
  Usuario,

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
