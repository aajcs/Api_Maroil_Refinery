const { Schema, model } = require("mongoose");

const RefineriaSchema = Schema(
  {
    ubicacion: {
      type: String,
      required: [true, "Ubicación física de la refineria es necesaria"],
    },

    nombre: {
      type: String,
      required: [true, "NIT es necesario"],
    },

    nit: {
      type: String,
      required: [true, "NIT es necesario"],
    },

    img: {
      type: String,
    },
    estado: {
      type: String,
      default: "true",
    },
    eliminado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

RefineriaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Refineria", RefineriaSchema);
