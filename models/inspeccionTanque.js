const { Schema, model } = require("mongoose");

const inspeccionTanqueSchema = Schema(
  {
    fecha: {
      type: Date,
      required: [true, "Fecha de inspección obligatoria"],
    },
    hora: {
      type: Date,
      required: [true, "Hora de inspección obligatoria"],
    },
    id_tanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque",
      required: true,
    },
    almacenamiento: {
      type: Number,
      required: [true, "Almacenamiento obligatorio"],
    },
    presion: {
      type: Number,
      required: [true, "Presión del tanque obligatorio"],
    },
    temperatura: {
      type: Number,
      required: [true, "Temperatura del tanque obligatoria"],
    },
    densidad: {
      type: Number,
      required: [
        true,
        "Densidad del material almacenado al momento de inspección es obligatorio",
      ],
    },
    caudal: {
      type: Number,
      required: [
        true,
        "Caudal del material almacenado al momento de inspección es obligatorio",
      ],
    },
    impurezas: {
      type: Number,
      required: [
        true,
        "Porcentaje de impurezas al momento de inspección es obligatorio",
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

inspeccionTanqueSchema.methods.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("InspeccionTanque", inspeccionTanqueSchema);
