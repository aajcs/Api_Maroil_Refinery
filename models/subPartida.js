const { Schema, model } = require("mongoose");
const auditPlugin = require("./plugins/audit");

// Esquema principal de refinación
const SubPartidaSchema = new Schema(
  {
   // Relación con el modelo Refinería
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: [
        true,
        "El ID de la Refinería asociada a la recepción es obligatorio",
      ], // Campo obligatorio
    },


    idPartida: {
      type: Schema.Types.ObjectId,
      ref: "Partida", // Relación con el modelo Partida
      required: [true, "El ID de la partida es obligatorio"], // Campo obligatorio
    },

    // Descripcion de la partida
    descripcion: {
      type: String,
      required: [true, "La partida es obligatoria"], // Campo obligatorio
    },

    // Descripcion de la partida
    codigo: {
      type: Number,
      required: [true, "La partida es obligatoria"], // Campo obligatorio
    },

    // Eliminación lógica
    eliminado: {
      type: Boolean,
      default: false, // Valor por defecto
    },
  },
  {
    // Agrega automáticamente las propiedades createdAt y updatedAt
    timestamps: true,
    // Elimina la propiedad __v que agrega Mongoose por defecto
    versionKey: false,
  }
);
SubPartidaSchema.plugin(auditPlugin);

// Método para transformar el objeto devuelto por Mongoose
SubPartidaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Exporta el modelo Partida basado en el esquema definido
module.exports = model("SubPartida", SubPartidaSchema);
