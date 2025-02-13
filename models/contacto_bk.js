const { Schema, model } = require("mongoose");

const ContactoSchema = new Schema(
  {
    id_refineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: false,
    },
    nombre: {
      type: String,
      required: [true, "El Nombre es obligatorio"],
    },
    identificacionFiscal: {
      type: String,
      unique: [true, "La identificacion fiscal es obligatoria"],
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
    },
    representanteLegal: {
      type: String,
    },
    direccion: {
      type: String,
      required: [true, "La dirección es obligatoria"],
    },
    telefono: {
      type: String,
      // required: [true, "El telefono es obligatorio"],
    },
    tipo: {
      type: String,
      enum: ["cliente", "proveedor"],
      required: [true, "Seleccione que tipo de contacto es"],
    },
    // createdBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Usuario",
    //   required: true,
    // },
    estado: {
      type: String,
      default: true,
    },
    eliminado: {
      type: Boolean,
      default: false,
    },
    // updatedBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Usuario",
    // },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ContactoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Contacto", ContactoSchema);
