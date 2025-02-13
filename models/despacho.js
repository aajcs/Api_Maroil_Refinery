const { Schema, model } = require("mongoose");

const DespachoSchema = Schema(
  {
    fecha: {
      type: Date,
      required: [true, "Fecha de recepción obligatoria"],
    },
    hora: {
      type: Date,
      required: [true, "Hora de recepción obligatoria"],
    },
    idLote: {
      type: Schema.Types.ObjectId,
      ref: "Lotes_producto",
      required: true,
    },

    idLinea: {
      type: Schema.Types.ObjectId,
      ref: "LineaCarga",
      required: true,
    },

    idEmpresa: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },

    numeroGuia: {
      type: Number,
      required: [true, "Número de guía obligatorio"],
    },
    placa: {
      type: String,
      required: [true, "Placa del Vehículo obligatorio"],
    },
    nombreChofer: {
      type: String,
      required: [true, "Nombre del Chofer obligatorio"],
    },
    apellidoChofer: {
      type: String,
      required: [true, "Apellido del chofer obligatorio"],
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

DespachoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Despacho", DespachoSchema);
