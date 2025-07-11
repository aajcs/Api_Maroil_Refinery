const { Schema, model } = require("mongoose");
const auditPlugin = require("./plugins/audit");
const Counter = require("./counter");

// Esquema principal de facturación
const FacturaSchema = new Schema(
  {
   idRefineria: 
      {
        type: Schema.Types.ObjectId,
        ref: "Refineria",
      },
    

   idLineasFactura: [
      {
        type: Schema.Types.ObjectId,
        ref: "LineaFactura", // Referencia al modelo LineaFactura
        required: [true, "El ID de la línea de factura es obligatorio"], // Campo
      },
    ],

    concepto: {
      type: String,
      required: [true, "El concepto de la factura es obligatorio"], // Campo obligatorio
      minlength: [5, "El concepto debe tener al menos 5 caracteres"], // Validación de longitud mínima
      maxlength: [50, "El concepto no puede exceder los 50 caracteres"], // Validación de longitud máxima
    },

    
    // Monto total de la factura
    total: {
      type: Number,
      min: [0, "El total no puede ser negativo"], // Validación para evitar valores negativos
      required: [false, "El total de la factura es obligatorio"], // Campo obligatorio
    },

    aprobada: {
      type: String,
      enum: ["pendiente", "aprobada", "rechazada"], // Valores permitidos
      default: "pendiente", // Valor por defecto
    },

    // idPartida: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Partida", // Relación con el modelo Partida
    //   required: [false, "El ID de la partida es obligatorio"], // Campo obligatorio
    // },

    
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

// Middleware para generar un número único y secuencial
FacturaSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counterKey = "factura"; // Clave para el contador
      const result = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.numeroFactura = result.seq; // Asigna el número secuencial
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

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
