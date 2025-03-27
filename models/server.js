const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const { dbConnection } = require("../database/config");
const Sockets = require("./sockets");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    this.paths = {
      auth: "/api/auth",
      buscar: "/api/buscar",
      categorias: "/api/categorias",
      producto: "/api/producto",
      usuarios: "/api/usuarios",
      uploads: "/api/uploads",
      refinerias: "/api/refinerias",
      lineaCarga: "/api/lineaCarga",
      lineaDespacho: "/api/lineaDespacho",
      bomba: "/api/bomba",
      tanque: "/api/tanque",
      torre: "/api/torre",
      contrato: "/api/contrato",
      contacto: "/api/contacto",
      recepcion: "/api/recepcion",
      refinacion: "/api/refinacion",
      despacho: "/api/despacho",
      chequeoCalidad: "/api/chequeoCalidad",
      chequeoCantidad: "/api/chequeoCantidad",
      historial: "/api/historial",
      costo: "/api/costo",
      refinacionSalida: "/api/refinacionSalida",
      balance: "/api/balance",
      tipoProducto: "/api/tipoProducto",
      simulacion: "/api/simulacion",
      inventario: "/api/inventario",

      bunker: "/api/bunker/bunker",
      balanceBunker: "/api/bunker/balanceBunker",
      barcaza: "/api/bunker/barcaza",
      chequeoCalidadBunker: "/api/bunker/ChequeoCalidadBunker",
      chequeoCantidadBunker: "/api/bunker/chequeoCantidadBunker",
      productoBunker: "/api/bunker/productoBunker",
      contratoBunker: "/api/bunker/contratoBunker",
      contactoBunker: "/api/bunker/contactoBunker",
      recepcionBunker: "/api/bunker/recepcionBunker",
      historialBunker: "/api/bunker/historialBunker",
      costoBunker: "/api/bunker/costoBunker",
      lineaCargaBunker: "/api/bunker/lineaCargaBunker",
    };

    // Conectar a base de datos
    this.conectarDB();
    // Http server
    this.middlewares();
    this.server = http.createServer(this.app);

    // Middlewares
    // Configuraciones de sockets
    this.io = socketio(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"], // Acepta WebSocket y polling
    });
    this.app.use((req, res, next) => {
      req.io = this.io;
      next();
    });
    // Rutas de mi aplicación
    this.routes();
  }

  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    // CORS
    this.app.use(cors());

    // Lectura y parseo del body
    this.app.use(express.json());

    // Directorio Público
    this.app.use(express.static("public"));

    // Fileupload - Carga de archivos
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
      })
    );
  }

  routes() {
    // Rutas de autenticación y usuarios
    this.app.use(this.paths.auth, require("../routes/auth"));
    this.app.use(this.paths.usuarios, require("../routes/usuarios"));

    // Rutas de gestión general
    this.app.use(this.paths.balance, require("../routes/balance"));
    this.app.use(this.paths.buscar, require("../routes/buscar"));
    this.app.use(this.paths.categorias, require("../routes/categorias"));
    this.app.use(this.paths.costo, require("../routes/costo"));
    this.app.use(this.paths.historial, require("../routes/historial"));
    this.app.use(this.paths.producto, require("../routes/producto"));
    this.app.use(this.paths.tipoProducto, require("../routes/tipoProducto"));
    this.app.use(this.paths.simulacion, require("../routes/simulacion"));
    this.app.use(this.paths.inventario, require("../routes/inventario"));

    // Rutas relacionadas con operaciones de calidad y cantidad
    this.app.use(
      this.paths.chequeoCalidad,
      require("../routes/chequeoCalidad")
    );
    this.app.use(
      this.paths.chequeoCantidad,
      require("../routes/chequeoCantidad")
    );

    // Rutas específicas de refinación y despacho
    this.app.use(this.paths.despacho, require("../routes/despacho"));
    this.app.use(this.paths.recepcion, require("../routes/recepcion"));
    this.app.use(this.paths.refinacion, require("../routes/refinacion"));
    this.app.use(
      this.paths.refinacionSalida,
      require("../routes/refinacionSalida")
    );
    this.app.use(this.paths.refinerias, require("../routes/refinerias"));

    // Rutas de infraestructura
    this.app.use(this.paths.bomba, require("../routes/bomba"));
    this.app.use(this.paths.lineaCarga, require("../routes/lineaCarga"));
    this.app.use(this.paths.lineaDespacho, require("../routes/lineaDespacho"));
    this.app.use(this.paths.tanque, require("../routes/tanque"));
    this.app.use(this.paths.torre, require("../routes/torre"));

    // Rutas relacionadas con contactos y contratos
    this.app.use(this.paths.contacto, require("../routes/contacto"));
    this.app.use(this.paths.contrato, require("../routes/contrato"));

    // Rutas de archivos y cargas
    this.app.use(this.paths.uploads, require("../routes/uploads"));

    // Rutas específicas del módulo Bunker
    const bunkerRoutes = "../routes/bunker";
    this.app.use(this.paths.bunker, require(`${bunkerRoutes}/bunker`));
    this.app.use(
      this.paths.balanceBunker,
      require(`${bunkerRoutes}/balanceBunker`)
    );
    this.app.use(this.paths.barcaza, require(`${bunkerRoutes}/barcaza`));
    this.app.use(
      this.paths.chequeoCalidadBunker,
      require(`${bunkerRoutes}/chequeoCalidadBunker`)
    );
    this.app.use(
      this.paths.chequeoCantidadBunker,
      require(`${bunkerRoutes}/chequeoCantidadBunker`)
    );
    this.app.use(
      this.paths.contactoBunker,
      require(`${bunkerRoutes}/contactoBunker`)
    );
    this.app.use(
      this.paths.contratoBunker,
      require(`${bunkerRoutes}/contratoBunker`)
    );
    this.app.use(
      this.paths.costoBunker,
      require(`${bunkerRoutes}/costoBunker`)
    );
    this.app.use(
      this.paths.historialBunker,
      require(`${bunkerRoutes}/historialBunker`)
    );
    this.app.use(
      this.paths.lineaCargaBunker,
      require(`${bunkerRoutes}/lineaCargaBunker`)
    );
    this.app.use(
      this.paths.productoBunker,
      require(`${bunkerRoutes}/productoBunker`)
    );
    this.app.use(
      this.paths.recepcionBunker,
      require(`${bunkerRoutes}/recepcionBunker`)
    );
  }

  configurarSockets() {
    new Sockets(this.io);
  }
  listen() {
    // Inicializar sockets
    this.configurarSockets();
    this.server.listen(this.port, () => {
      console.log("Servidor corriendo en puerto", this.port);
    });
  }
}

module.exports = Server;
