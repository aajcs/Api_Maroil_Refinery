const { Schema, model } = require("mongoose");

const ContratoSchema = Schema(
  {
    id_empresa: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: false,
    },
    producto: {
      type: String /*deberia ser una lista pre cargada de productos*/,
      required: [false, "Descripción del producto obligatoria"],
    },
    fecha: {
      type: Date,
      required: [false, "Fecha de lote obligatoria"],
    },
    gravedad: {
      type: Number,
      required: [false, "% Api requerido"],
    },
    azufre: {
      type: Number,
      required: [false, "% de Azufre requerido"],
    },
    viscocidad: {
      type: Number,
      required: [false, "% de de Viscocidad requerido"],
    },
    origen: {
      type: String,
      required: [false, "Origen del lote obligatorio"],
    },
    temperatura: {
      type: Number,
      required: [false, "Temperatura del lote obligatorio"],
    },
    presion: {
      type: String,
      required: [false, "Presión del lote obligatorio"],
    },
    valor: {
      type: Number,
      required: [false, "Valor del lote en $ es necesario."],
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
