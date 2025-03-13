const { Schema, model } = require("mongoose");

const ContratoSchema = Schema(
  {
    numeroContrato: {
      type: String,
      required: [false, "El número de contrato es obligatorio"],
      unique: false,
    },
    descripcion: {
      type: String,
      required: [false, "La Descripcion es Obligatoria"],
      unique: false,
    },
    tipoContrato: {
      type: String,
      enum: ["Compra", "Venta"],
      default: "Compra",
    },

    estadoContrato: {
      type: String,
      enum: ["Adjudicado", "Activo", "Inactivo"],
      default: "Inactivo",
    },
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },
    idContacto: {
      type: Schema.Types.ObjectId,
      ref: "Contacto",
      required: false,
    },

    //ASIGNACIÓN ID DE CONTRATO SEGUN TIPO "COMPRA O VENTA"
    // idContratoCompra: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Contrato",
    //   required: false,
    // },
    // idContratoVenta: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Contrato",
    //   required: false,
    // },

    // Array de IDs,
    idItems: [{ type: Schema.Types.ObjectId, ref: "ContratoItems" }],

    fechaInicio: {
      type: Date,
      required: [false, "La fecha de inicio es obligatoria"],
    },
    fechaFin: {
      type: Date,
      required: [false, "La fecha de finalización es obligatoria"],
    },

    condicionesPago: {
      tipo: {
        type: String,
        enum: ["Contado", "Crédito"],
        default: "Contado",
      },

      plazo: {
        type: Number, // Días de plazo si es crédito
        default: 0,
      },
    },

    montoTransporte: {
      type: Number,
      required: [false, "El Monto del transporte es Requerido"],
    },

    montoTotal: {
      type: Number,
      required: [false, "El Monto total es requerido"],
    },

    abono: [
      {
        monto: { type: Number, required: false },
        fecha: { type: Date, required: false },
      },
    ],
    destino: {
      type: String,
      required: [false, "El destino es obligatorio"],
    },

    fechaEnvio: {
      type: Date,
      required: [false, "La fecha de envío es obligatoria"],
    },
    estadoEntrega: {
      type: String,
      enum: ["Pendiente", "En Tránsito", "Entregado", "Cancelado"],
      default: "Pendiente",
    },
    clausulas: {
      type: [String],
      default: [],
    },
    historialModificaciones: [
      {
        fecha: { type: Date, default: Date.now },
        usuario: { type: String, required: true },
        cambios: { type: String, required: true },
      },
    ],

    estado: {
      type: String,
      default: true,
    },
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
ContratoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    //delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Contrato", ContratoSchema);
