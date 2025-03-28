const { Schema, model } = require("mongoose");

// Definición del esquema para el modelo TipoProducto
const TipoProductoSchema = Schema(
  {
    // Relación con el modelo Refinería
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: [true, "El ID de la refinería es obligatorio"], // Campo obligatorio
    },

    // Relación con el modelo Producto
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: "Producto", // Relación con el modelo Producto
      required: [true, "El ID del producto es obligatorio"], // Campo obligatorio
    },

    // Nombre del producto
    nombre: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"], // Campo obligatorio
      minlength: [3, "El nombre debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    // Clasificación del producto (Liviano, Mediano, Pesado)
    clasificacion: {
      type: String,
      enum: ["Liviano", "Mediano", "Pesado"], // Valores permitidos
      required: [true, "La clasificación del producto es obligatoria"], // Campo obligatorio
    },

    // Gravedad API del producto
    gravedadAPI: {
      type: Number,
      min: [0, "La gravedad API no puede ser negativa"], // Validación para evitar valores negativos
      max: [100, "La gravedad API no puede exceder 100"], // Validación de rango máximo
      required: [true, "La gravedad API del producto es obligatoria"], // Campo obligatorio
    },

    // Porcentaje de azufre en el producto
    azufre: {
      type: Number,
      min: [0, "El porcentaje de azufre no puede ser negativo"], // Validación para evitar valores negativos
      max: [100, "El porcentaje de azufre no puede exceder el 100%"], // Validación de rango máximo
      required: [true, "El porcentaje de azufre en el producto es obligatorio"], // Campo obligatorio
    },

    // Contenido de agua en el producto
    contenidoAgua: {
      type: Number,
      min: [0, "El contenido de agua no puede ser negativo"], // Validación para evitar valores negativos
      max: [100, "El contenido de agua no puede exceder el 100%"], // Validación de rango máximo
      required: [true, "El contenido de agua en el producto es obligatorio"], // Campo obligatorio
    },

    // Punto de inflamación (Flashpoint) del producto
    flashPoint: {
      type: Number,
      min: [0, "El punto de inflamación no puede ser negativo"], // Validación para evitar valores negativos
      required: [
        true,
        "El punto de inflamación (Flashpoint) del producto es obligatorio",
      ], // Campo obligatorio
    },
    // Rendimiento del producto

    rendimientos: [
      {
        idProducto: { type: Schema.Types.ObjectId, ref: "Producto" },
        gas: { type: Number, min: 0, required: true },
        nafta: { type: Number, min: 0, required: true },
        kerosene: { type: Number, min: 0, required: true },
        fo4: { type: Number, min: 0, required: true },
        fo6: { type: Number, min: 0, required: true },
      },
    ],
    // Estado del producto (Activo o Inactivo)
    estado: {
      type: String,
      enum: ["Activo", "Inactivo"], // Valores permitidos
      default: "Activo", // Valor por defecto
    },

    // Indica si el producto ha sido eliminado (eliminación lógica)
    eliminado: {
      type: Boolean,
      default: false, // Valor por defecto
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    versionKey: false, // Elimina el campo __v
  }
);

// Configuración para transformar el objeto JSON al devolverlo
TipoProductoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("TipoProducto", TipoProductoSchema);
