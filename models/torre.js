const { Schema, model } = require("mongoose");
const { stringify } = require("uuid");

const TorreSchema = Schema(
  {
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },
    nombre: {
      type: String,
      required: [true, "El Nombre es obligatorio"],
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"],
    },
    ubicacion: {
      type: String,
      required: [true, "La ubicación es obligatoria"],
      maxlength: [100, "La ubicación no puede exceder los 100 caracteres"],
    },
    caudal: {
      type: Number,
      min: [0, "El caudal no puede ser negativo"],
      required: false,
    },
    densidad: {
      type: Number,
      min: [0, "La densidad no puede ser negativa"],
      required: false,
    },
    presion: {
      type: Number,
      min: [0, "La presión no puede ser negativa"],
      required: false,
    },

    material: [
      {
        idProducto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: [true, "El ID del Producto del derivado es obligatorio"],
        },
        estadoMaterial: {
          type: String,
          enum: ["bueno", "regular", "malo"], // Ejemplo de valores permitidos
          required: false,
        },
      },
    ],

    //Controladores Logicos y de eliminacion

    estado: {
      type: String,
      enum: ["activo", "inactivo"], // Valores permitidos
      default: "activo",
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

TorreSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Torre", TorreSchema);
