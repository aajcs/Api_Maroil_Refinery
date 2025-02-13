const { Schema, model } = require("mongoose");

const lineaDespachoSchema = Schema(
  {
    ubicacion: {
      type: String,
      required: [true, "Fecha de despacho obligatoria"],
    },

    nombre: {
      type: String,
      required: [true, "Nombre de linea obligatorio"],
    },

    // id_refineria: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Refineria",
    //   required: true,
    // },
    idDespacho: {
      type: Schema.Types.ObjectId,
      ref: "Despacho",
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

lineaDespachoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
module.exports = model("LineaDespacho", lineaDespachoSchema);
