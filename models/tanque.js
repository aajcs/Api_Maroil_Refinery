const { Schema, model } = require("mongoose");

// Definición del esquema para el modelo Tanque
const TanqueSchema = Schema(
  {
    // Referencia a la refinería a la que pertenece el tanque
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: true, // Campo obligatorio
    },

    // Capacidad máxima del tanque en unidades específicas (por ejemplo, litros o barriles)
    capacidad: {
      type: Number,
      min: [0, "La capacidad no puede ser negativa"], // Validación para evitar valores negativos
      required: [true, "La capacidad es obligatoria"], // Campo obligatorio
    },

    // Porcentaje de almacenamiento actual del tanque
    almacenamiento: {
      type: Number,
      min: [0, "El porcentaje de almacenamiento no puede ser negativo"], // Validación para evitar valores negativos
      max: [100, "El porcentaje de almacenamiento no puede exceder el 100%"], // Validación para evitar valores mayores al 100%
      required: [true, "El porcentaje de almacenamiento es obligatorio"], // Campo obligatorio
    },

    // Nombre del tanque
    nombre: {
      type: String,
      required: [true, "El Nombre es obligatorio"], // Campo obligatorio
      minlength: [3, "El nombre debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    // Ubicación física del tanque dentro de la refinería
    ubicacion: {
      type: String,
      required: [true, "La ubicación es obligatoria"], // Campo obligatorio
      maxlength: [100, "La ubicación no puede exceder los 100 caracteres"], // Validación de longitud máxima
    },

    // Indica si el tanque se utiliza para almacenar materia prima
    almacenamientoMateriaPrimaria: {
      type: Boolean,
      required: [true, "El almacenamiento de materia prima es obligatorio"], // Campo obligatorio
      default: false, // Valor por defecto
    },

    // Referencia al producto almacenado en el tanque (si aplica)
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto", // Relación con el modelo Producto
      required: [false, "El ID del Producto del derivado es obligatorio"], // Campo opcional
    },

    // Relación con el modelo Tanque (opcional)
    idChequeoCalidad: {
      type: Schema.Types.ObjectId,
      ref: "ChequeoCalidad", // Relación con el modelo Tanque
      required: false, // Campo obligatorio
    },

    // Relación con el chequeo de cantidad
    idChequeoCantidad: {
          type: Schema.Types.ObjectId,
          ref: "ChequeoCantidad", // Relación con el chequeo cantidad
          required: false, // Campo obligatorio
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

// Configuración para transformar el objeto JSON al devolverlo
TanqueSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    // Cambia el nombre de _id a id
    returnedObject.id = returnedObject._id.toString();
    // Elimina las propiedades innecesarias del objeto devuelto
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Exporta el modelo Tanque basado en el esquema definido
module.exports = model("Tanque", TanqueSchema);
