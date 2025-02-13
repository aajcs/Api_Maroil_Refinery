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

linea_cargaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
module.exports = model("Linea_carga", linea_cargaSchema);
