const { Schema, model } = require("mongoose");

// Definición del esquema para el modelo Producto
const ProductoSchema = Schema(
  {
    // Relación con el modelo Refinería
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: true, // Campo obligatorio
    },

    // Nombre del producto
    nombre: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"], // Campo obligatorio
      minlength: [3, "El nombre debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    // Posición del producto
    posicion: {
      type: Number,
      min: [0, "La posición no puede ser negativa"], // Validación para evitar valores negativos
      required: [true, "La posición del producto es obligatoria"], // Campo obligatorio
    },

    // Color del producto
    color: {
      type: String,
      required: [true, "El color del producto es obligatorio"], // Campo obligatorio
      minlength: [3, "El color debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [20, "El color no puede exceder los 20 caracteres"], // Validación de longitud máxima
    },

    // Tipo de material (Materia Prima o Derivado)
    tipoMaterial: {
      type: String,
      enum: ["Materia Prima", "Derivado"], // Valores permitidos
      required: [true, "El tipo de material es obligatorio"], // Campo obligatorio
    },

    // Relación con el modelo TipoProducto
    idTipoProducto: [
      {
        type: Schema.Types.ObjectId,
        ref: "TipoProducto", // Relación con el modelo TipoProducto
      },
    ],

    // Estado del producto (activo o inactivo)
    estado: {
      type: String,
      enum: ["activo", "inactivo"], // Valores permitidos
      default: "activo", // Valor por defecto
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

// Configuración para transformar el objeto JSON al devolverlo
ProductoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Exporta el modelo Producto basado en el esquema definido
module.exports = model("Producto", ProductoSchema);
