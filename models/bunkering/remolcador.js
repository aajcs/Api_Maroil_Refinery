const { Schema, model } = require("mongoose");
const auditPlugin = require("./plugins/audit");

// Definición del esquema para el modelo Remolcador
const RemolcadorSchema = Schema(
  {
    // Referencia a la refinería a la que pertenece el tanque
    idBunkering: {
      type: Schema.Types.ObjectId,
      ref: "Bunkering", // Relación con el modelo Bunkering
      required: true, // Campo obligatorio
    },

    // Referencia a la refinería a la que pertenece el tanque
    idGabarra: {
      type: Schema.Types.ObjectId,
      ref: "Gabarra", // Relación con el modelo Bunkering
      required: true, // Campo obligatorio
    },

    // Nombre del tanque
    nombre: {
      type: String,
      required: [true, "El Nombre es obligatorio"], // Campo obligatorio
      minlength: [3, "El nombre debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    imo: {
      type: String,
      required: [true, "El Nombre es obligatorio"], // Campo obligatorio
      minlength: [3, "El nombre debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    // Estado del tanque (activo o inactivo)
    estado: {
      type: String,
      default: true, // Valor por defecto
    },

    // Indica si el tanque ha sido eliminado (lógica de eliminación suave)
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

// Agrega índice compuesto único para nombre por refinería
RemolcadorSchema.index({ idBunkering: 1, nombre: 1 }, { unique: true });
RemolcadorSchema.plugin(auditPlugin);
// Configuración para transformar el objeto JSON al devolverlo
RemolcadorSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    // Cambia el nombre de _id a id
    returnedObject.id = returnedObject._id.toString();
    // Elimina las propiedades innecesarias del objeto devuelto
    delete returnedObject.__v;
  },
});

// Exporta el modelo Remolcador basado en el esquema definido
module.exports = model("Remolcador", RemolcadorSchema);
