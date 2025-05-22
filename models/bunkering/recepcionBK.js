const { Schema, model } = require("mongoose");
const auditPlugin = require("../plugins/audit");
const Counter = require("../counter");

// Subesquema para los datos de la tractomula
const DatosTractomulaSchema = new Schema(
  {
    idGuia: {
      type: Number,
      required: [false, "El ID de la Guía es obligatorio"],
    },
    placa: {
      type: String,
      maxlength: [10, "La placa no puede exceder los 10 caracteres"],
      required: [false, "La placa es obligatoria"],
    },
    // Puedes agregar más campos aquí si lo necesitas
  },
  { _id: false }
);

// Subesquema para Tractomula
const TractomulaSchema = new Schema(
  {
    datosTractomula: {
      type: DatosTractomulaSchema,
      required: true,
    },
    datosChofer: {
      type: Object,
      required: true,
    },
  },
  { _id: false }
);

// Subesquema para Muelle
const MuelleSchema = new Schema(
  {
    idMuelle: {
      type: Schema.Types.ObjectId,
      ref: "Muelle",
      required: true,
    },
  },
  { _id: false }
);

// Subesquema para Bunkering
const EmbarcacionSchema = new Schema(
  {
    datosEmbarcacion: {
      type: Object,
      required: true,
    },
  },
  { _id: false }
);

// Definición del esquema para el modelo Recepción
const RecepcionBKSchema = new Schema(
  {
    // Número de despacho
    numeroRecepcionBK: {
      type: Number,
    },
    // Relación con el modelo Contrato
    idContrato: {
      type: Schema.Types.ObjectId,
      ref: "ContratoBK",
      required: [
        true,
        "El ID del Contrato asociado a la recepción es obligatorio",
      ],
    },
    idContratoItems: {
      type: Schema.Types.ObjectId,
      ref: "ContratoItemsBK",
    },
    idLinea: {
      type: Schema.Types.ObjectId,
      ref: "LineaCargaBK",
    },
    idBunkering: {
      type: Schema.Types.ObjectId,
      ref: "Bunkering",
      required: [
        true,
        "El ID del Bunkering asociada a la recepción es obligatorio",
      ],
    },
    idMuelle: {
      type: Schema.Types.ObjectId,
      ref: "Muelle",
    },
    idEmbarcacion: {
      type: Schema.Types.ObjectId,
      ref: "Embarcacion",
    },
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "ProductoBK",
    },
    idTanque: {
      type: Schema.Types.ObjectId,
      ref: "TanqueBK",
    },
    idChequeoCalidad: {
      type: Schema.Types.ObjectId,
      ref: "ChequeoCalidadBK",
      required: false,
    },
    idChequeoCantidad: {
      type: Schema.Types.ObjectId,
      ref: "ChequeoCantidadBK",
      required: false,
    },
    cantidadRecibida: {
      type: Number,
      min: [0, "La cantidad recibida no puede ser negativa"],
    },
    cantidadEnviada: {
      type: Number,
      min: [0, "La cantidad enviada no puede ser negativa"],
      required: [true, "La cantidad enviada es obligatoria"],
    },
    estadoRecepcion: {
      type: String,
    },
    estadoCarga: {
      type: String,
    },
    estado: {
      type: String,
    },
    fechaInicio: {
      type: Date,
    },
    fechaFin: {
      type: Date,
    },
    fechaDespacho: {
      type: Date,
    },
    fechaInicioRecepcion: {
      type: Date,
    },
    fechaFinRecepcion: {
      type: Date,
    },
    fechaSalida: {
      type: Date,
    },
    fechaLlegada: {
      type: Date,
    },

    // NUEVO CAMPO: Tipo de recepción y su estructura asociada
    tipo: {
      type: String,
      required: [true, "El tipo de recepción es obligatorio"],
      enum: ["Tractomula", "Muelle", "Bunkering"],
    },
    tractomula: {
      type: TractomulaSchema,
      required: function () {
        return this.tipo === "Tractomula";
      },
      default: undefined,
    },
    muelle: {
      type: MuelleSchema,
      required: function () {
        return this.tipo === "Muelle";
      },
      default: undefined,
    },
    bunkering: {
      type: EmbarcacionSchema,
      required: function () {
        return this.tipo === "Bunkering";
      },
      default: undefined,
    },

    // Control de estado (eliminación lógica)
    eliminado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

RecepcionBKSchema.plugin(auditPlugin);

RecepcionBKSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Middleware para generar un número único de refinación
RecepcionBKSchema.pre("save", async function (next) {
  if (this.isNew && this.idBunkering) {
    try {
      const counterKey = `recepcionBK_${this.idBunkering.toString()}`;
      let bunkeringCounter = await Counter.findOne({ _id: counterKey });

      if (!bunkeringCounter) {
        bunkeringCounter = new Counter({ _id: counterKey, seq: 999 });
        await bunkeringCounter.save();
      }

      bunkeringCounter.seq += 1;
      await bunkeringCounter.save();

      this.numeroRecepcionBK = bunkeringCounter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = model("RecepcionBK", RecepcionBKSchema);
