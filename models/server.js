const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const { dbConnection } = require("../database/config");
const Sockets = require("./sockets");
const balance = require("./balance");

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
    this.app.use(this.paths.auth, require("../routes/auth"));
    this.app.use(this.paths.buscar, require("../routes/buscar"));
    this.app.use(this.paths.categorias, require("../routes/categorias"));
    this.app.use(this.paths.producto, require("../routes/producto"));
    this.app.use(this.paths.usuarios, require("../routes/usuarios"));
    this.app.use(this.paths.uploads, require("../routes/uploads"));
    this.app.use(this.paths.refinerias, require("../routes/refinerias"));
    this.app.use(this.paths.lineaCarga, require("../routes/lineaCarga"));
    this.app.use(this.paths.bomba, require("../routes/bomba"));
    this.app.use(this.paths.tanque, require("../routes/tanque"));
    this.app.use(this.paths.torre, require("../routes/torre"));
    this.app.use(this.paths.contrato, require("../routes/contrato"));
    this.app.use(this.paths.contacto, require("../routes/contacto"));
    this.app.use(this.paths.recepcion, require("../routes/recepcion"));
    this.app.use(this.paths.refinacion, require("../routes/refinacion"));
    this.app.use(this.paths.despacho, require("../routes/despacho"));
    this.app.use(
      this.paths.chequeoCalidad,
      require("../routes/chequeoCalidad")
    );
    this.app.use(
      this.paths.chequeoCantidad,
      require("../routes/chequeoCantidad")
    );
    this.app.use(this.paths.historial, require("../routes/historial"));
    this.app.use(this.paths.costo, require("../routes/costo"));
    this.app.use(
      this.paths.refinacionSalida,
      require("../routes/refinacionSalida")
    );
    this.app.use(this.paths.balance, require("../routes/balance"));
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
