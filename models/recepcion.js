const { Schema, model } = require("mongoose");

const RecepcionSchema = Schema(
  {
    contrato: {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
      required: true,
    },

    cantidadRecibida: {
      type: Number,
      required: [true, "Cantidad recibida obligatoria"],
    },

    precioUnitario: {
      type: Number,
      required: [true, "Precio Unitario obligatorio"],
    },

    montoTotal: {
      type: Number,
      required: [true, "Monto Total obligatorio"],
    },

    estado: {
      type: String,
      enum: ["En tránsito", "Entregado"],
      default: "En tránsito",
    },

    fechaRecepcion: {
      type: Date,
      required: [true, "Fecha de recepción obligatoria"],
    },
    hora: {
      type: Date,
      required: [true, "Hora de recepción obligatoria"],
    },
    id_lote: {
      type: Schema.Types.ObjectId,
      ref: "Lotes_producto",
      required: true,
    },

    id_linea: {
      type: Schema.Types.ObjectId,
      ref: "Linea_carga",
      required: true,
    },
    id_tanqueRecepcion: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: true,
    },

    id_guia: {
      type: Number,
      required: [true, "Número de guía obligatorio"],
    },
    placa: {
      type: String,
      required: [true, "Placa del Vehículo obligatorio"],
    },
    nombre_chofer: {
      type: String,
      required: [true, "Nombre del Chofer obligatorio"],
    },
    apellido_chofer: {
      type: String,
      required: [true, "Apellido del chofer obligatorio"],
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
  return Recepcion;
};

module.exports = model("Recepcion", RecepcionSchema);
