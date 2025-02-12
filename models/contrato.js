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
    estado_contrato: {
      type: String,
      enum: ["Adjudicado", "Activo", "Inactivo"],
      default: "Inactivo",
    },
    id_refineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: false,
    },
    id_contacto: {
      type: Schema.Types.ObjectId,
      ref: "Contacto",
      required: false,
    },

    id_items: [{ type: Schema.Types.ObjectId, ref: "ContratoItems" }], // Array de IDs,

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
ContratoSchema.methods.toJSON = function () {
  const { _id, ...contrato } = this.toObject();
  contrato.id = _id;
  return contrato;
};

module.exports = model("Contrato", ContratoSchema);
