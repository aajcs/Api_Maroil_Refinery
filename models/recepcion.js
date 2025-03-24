const { Schema, model } = require("mongoose");

// Definición del esquema para el modelo Recepción
const RecepcionSchema = new Schema(
  {
    // Relación con el modelo Contrato
    idContrato: {
      type: Schema.Types.ObjectId,
      ref: "Contrato", // Relación con el modelo Contrato
      required: [
        true,
        "El ID del Contrato asociado a la recepción es obligatorio",
      ], // Campo obligatorio
    },

    // Relación con los ítems del contrato (opcional)
    idContratoItems: {
      type: Schema.Types.ObjectId,
      ref: "ContratoItems", // Relación con el modelo ContratoItems
    },

    // Relación con el modelo Línea de Carga (opcional)
    idLinea: {
      type: Schema.Types.ObjectId,
      ref: "LineaCarga", // Relación con el modelo LineaCarga
    },

    // Relación con el modelo Refinería
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: [
        true,
        "El ID de la Refinería asociada a la recepción es obligatorio",
      ], // Campo obligatorio
    },

    // Relación con el modelo Tanque (opcional)
    idTanque: {
      type: Schema.Types.ObjectId,
      ref: "Tanque", // Relación con el modelo Tanque
    },

    // Información de la recepción
    cantidadRecibida: {
      type: Number,
      min: [0, "La cantidad recibida no puede ser negativa"], // Validación para evitar valores negativos
    },

    cantidadEnviada: {
      type: Number,
      min: [0, "La cantidad enviada no puede ser negativa"], // Validación para evitar valores negativos
      required: [true, "La cantidad enviada es obligatoria"], // Campo obligatorio
    },

    // Estado de la carga (en tránsito o entregado)
    estadoCarga: {
      type: String,
      enum: ["EN_TRANSITO", "ENTREGADO"], // Valores permitidos
      default: "EN_TRANSITO", // Valor por defecto
    },

    // Estado general de la recepción (activo o inactivo)
    estado: {
      type: String,
      enum: ["activo", "inactivo"], // Valores permitidos
      default: "activo", // Valor por defecto
    },

    // Fechas relacionadas con la recepción
    fechaInicio: {
      type: Date, // Fecha de inicio de la recepción
    },
    fechaFin: {
      type: Date, // Fecha de finalización de la recepción
    },
    fechaDespacho: {
      type: Date, // Fecha de despacho del transporte
    },

    // Información del transporte
    idGuia: {
      type: Number,
      required: [true, "El ID de la Guía es obligatorio"], // Campo obligatorio
    },
    placa: {
      type: String,
      required: [true, "La placa del transporte es obligatoria"], // Campo obligatorio
      minlength: [6, "La placa debe tener al menos 6 caracteres"], // Validación de longitud mínima
      maxlength: [10, "La placa no puede exceder los 10 caracteres"], // Validación de longitud máxima
    },
    nombreChofer: {
      type: String,
      required: [true, "El nombre del chofer es obligatorio"], // Campo obligatorio
      minlength: [3, "El nombre del chofer debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [
        20,
        "El nombre del chofer no puede exceder los 50 caracteres",
      ], // Validación de longitud máxima
    },
    apellidoChofer: {
      type: String,
      required: [true, "El apellido del chofer es obligatorio"], // Campo obligatorio
      minlength: [3, "El apellido del chofer debe tener al menos 3 caracteres"], // Validación de longitud mínima
      maxlength: [
        20,
        "El apellido del chofer no puede exceder los 50 caracteres",
      ], // Validación de longitud máxima
    },

    // Control de estado (eliminación lógica)
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

// Método para transformar el objeto devuelto por Mongoose
RecepcionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Cambia _id a id
    delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v
  },
});

// Exporta el modelo Recepción basado en el esquema definido
module.exports = model("Recepcion", RecepcionSchema);
