const { Schema, model } = require("mongoose");

// Definición del esquema para el modelo Refinería
const RefineriaSchema = Schema(
  {
    // Ubicación física de la refinería
    ubicacion: {
      type: String,
      required: [true, "Ubicación física de la refinería es necesaria"], // Campo obligatorio
      minlength: [3, "La ubicación debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [100, "La ubicación no puede exceder los 100 caracteres"], // Validación de longitud máxima
    },

    // Nombre de la refinería
    nombre: {
      type: String,
      required: [true, "El nombre de la refinería es necesario"], // Campo obligatorio
      minlength: [3, "El nombre debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    // Número de Identificación Tributaria (NIT)
    nit: {
      type: String,
      required: [true, "El NIT es necesario"], // Campo obligatorio
      unique: true, // Índice único para evitar duplicados
      minlength: [5, "El NIT debe tener al menos 5 caracteres"], // Validación de longitud mínima
      maxlength: [20, "El NIT no puede exceder los 20 caracteres"], // Validación de longitud máxima
    },

    // Imagen asociada a la refinería (opcional)
    img: {
      type: String, // URL de la imagen
    },

    // Estado de la refinería (activo o inactivo)
    estado: {
      type: String,
      enum: ["activo", "inactivo"], // Valores permitidos
      default: "activo", // Valor por defecto
    },

    // Indica si la refinería ha sido eliminada (eliminación lógica)
    eliminado: {
      type: Boolean,
      default: false, // Valor por defecto
    },
  },
  {
    timestamps: true,
  }
);

// Configuración para transformar el objeto JSON al devolverlo
RefineriaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Exporta el modelo Refinería basado en el esquema definido
module.exports = model("Refineria", RefineriaSchema);
