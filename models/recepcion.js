const { Schema, model } = require("mongoose");

const RecepcionSchema = Schema(
  {
    id_contrato: {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
      required: false,
    },

    cantidadRecibida: {
      type: Number,
      required: [false, "Cantidad recibida obligatoria"],
    },

    estado: {
      type: String,
      enum: ["En tránsito", "Entregado"],
      default: "En tránsito",
    },

    fechaInicio: {
      type: Date,
      required: [false, "Fecha de recepción obligatoria"],
    },
    fechaFin: {
      type: Date,
      required: [false, "Fecha de recepción obligatoria"],
    },

    id_linea: {
      type: Schema.Types.ObjectId,
      ref: "Linea_carga",
      required: false,
    },
    id_refineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: false,
    },

    id_tanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: false,
    },

    id_guia: {
      type: Number,
      required: [false, "Número de guía obligatorio"],
    },
    placa: {
      type: String,
      required: [false, "Placa del Vehículo obligatorio"],
    },
    nombre_chofer: {
      type: String,
      required: [false, "Nombre del Chofer obligatorio"],
    },
    apellido_chofer: {
      type: String,
      required: [false, "Apellido del chofer obligatorio"],
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

RecepcionSchema.methods.toJSON = function () {
  const { _id, ...recepcion } = this.toObject();
  recepcion.id = _id;
  return recepcion;
};

module.exports = model("Recepcion", RecepcionSchema);
