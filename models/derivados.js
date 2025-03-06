const { Schema, model } = require("mongoose");
const DerivadoSchema = Schema({
  nombreDerivado: {
    type: String,
    required: [false, "El nombre del derivado es obligatorio"],
    enum: ["Gasolina", "Diesel", "Jet Fuel", "Asfalto"], // Lista de derivados
  },
  cantidadProducida: {
    type: Number,
    required: [false, "La cantidad producida es obligatoria"],
  },
  calidad: {
    type: String,
    enum: ["Alta", "Media", "Baja"],
    default: "Alta",
  },
  fechaProduccion: {
    type: Date,
    default: Date.now,
  },
});

DerivadoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
module.exports = model("Derivado", DerivadoSchema);
