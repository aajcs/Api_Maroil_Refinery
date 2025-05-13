const { Schema, model } = require("mongoose");
const auditPlugin = require("./plugins/audit");

// Esquema para las líneas de facturación
const LineaFacturaSchema = new Schema(
  {
    descripcion: {
      type: String,
      required: [true, "La descripción de la línea es obligatoria"], // Campo obligatorio
      minlength: [5, "La descripción debe tener al menos 5 caracteres"], // Validación de longitud mínima
      maxlength: [200, "La descripción no puede exceder los 200 caracteres"], // Validación de longitud máxima
    },
    cantidad: {
      type: Number,
      min: [0, "La cantidad no puede ser negativa"], // Validación para evitar valores negativos
      required: [true, "La cantidad es obligatoria"], // Campo obligatorio
    },
    precioUnitario: {
      type: Number,
      min: [0, "El precio unitario no puede ser negativo"], // Validación para evitar valores negativos
      required: [true, "El precio unitario es obligatorio"], // Campo obligatorio
    },
    subtotal: {
      type: Number,
      min: [0, "El subtotal no puede ser negativo"], // Validación para evitar valores negativos
      required: [true, "El subtotal es obligatorio"], // Campo obligatorio
    },

    fecha: {
      type: Date,
      default: Date.now, // Valor por defecto: fecha actual
    },
  },
  {
    _id: false, // No se generará un _id para cada línea
  }
);

// Esquema principal de facturación
const FacturaSchema = new Schema(
  {
    // Relación con el modelo Refinería
    idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria", // Relación con el modelo Refineria
      required: [true, "El ID de la refinería es obligatorio"], // Campo obligatorio
    },

    concepto: {
      type: String,
      required: [true, "El concepto de la factura es obligatorio"], // Campo obligatorio
      minlength: [5, "El concepto debe tener al menos 5 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El concepto no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    // Líneas de facturación
    lineas: {
      type: [LineaFacturaSchema], // Array de subdocumentos
      validate: {
        validator: (v) => v.length > 0,
        message: "La factura debe tener al menos una línea de facturación",
      },
    },

    // Monto total de la factura
    total: {
      type: Number,
      min: [0, "El total no puede ser negativo"], // Validación para evitar valores negativos
      required: [true, "El total de la factura es obligatorio"], // Campo obligatorio
    },

    aprobada: {
      type: String,
      enum: ["pendiente", "aprobada", "rechazada"], // Valores permitidos
      default: "pendiente", // Valor por defecto
    },

    idPartida: {
      type: Schema.Types.ObjectId,
      ref: "Partida", // Relación con el modelo Partida
      required: [true, "El ID de la partida es obligatorio"], // Campo obligatorio
    },

    idSubPartida: {
      type: Schema.Types.ObjectId,
      ref: "SubPartida", // Relación con el modelo SubPartida
      required: [true, "El ID de la subpartida es obligatorio"], // Campo obligatorio
    },

    // Fechas de la factura
    fechaFactura: {
      type: Date,
      default: Date.now, // Valor por defecto: fecha actual
    },

    // Eliminación lógica
    eliminado: {
      type: Boolean,
      default: false, // Valor por defecto
    },

    // Estado general (activo o inactivo)
    estado: {
      type: String,
      enum: ["activo", "inactivo"], // Valores permitidos
      default: "activo", // Valor por defecto
    },
  },
  {
    // Agrega automáticamente las propiedades createdAt y updatedAt
    timestamps: true,
    // Elimina la propiedad __v que agrega Mongoose por defecto
    versionKey: false,
  }
);
FacturaSchema.plugin(auditPlugin);
// Método para transformar el objeto devuelto por Mongoose
FacturaSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convierte _id a id
    delete returnedObject._id; // Elimina _id
    delete returnedObject.__v; // Elimina __v
  },
});

// Exporta el modelo Factura basado en el esquema definido
module.exports = model("Factura", FacturaSchema);
