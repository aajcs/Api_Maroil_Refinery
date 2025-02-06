const { Schema, model } = require("mongoose");

const linea_cargaSchema = Schema(
  {
    ubicacion: {
      type: String,
      required: [true, "Fecha de recepción obligatoria"],
    },

    nombre: {
      type: String,
      required: [true, "Nombre de linea obligatorio"],
    },

    id_refineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },
    id_recepcion: {
      type: Schema.Types.ObjectId,
      ref: "Recepcion",
      required: true,
    },
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

linea_cargaSchema.methods.toJSON = function () {
  const { _id, ...linea_carga } = this.toObject();
  linea_carga.id = _id;
  return linea_carga;
};

module.exports = model("Linea_carga", linea_cargaSchema);
