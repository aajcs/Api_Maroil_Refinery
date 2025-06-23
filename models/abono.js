const { Schema, model } = require("mongoose");
const auditPlugin = require("./plugins/audit");

const AbonoSchema = Schema(
  {
    idContrato: {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
      required: true,
    },
    monto: {
      type: Number,
      required: true,
      min: [0, "El monto no puede ser negativo"],
    },
    fecha: {
      type: Date,
      required: true,
    },
    tipoOperacion: {
      type: String,
      enum: ["Efectivo", "Cheque", "Deposito"],
      required: true,
    },
    referencia: {
      type: String,
      required: true,
      minlength: [3, "La referencia debe tener al menos 3 caracteres"],
      maxlength: [100, "La referencia no puede exceder los 100 caracteres"],
    },
    eliminado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AbonoSchema.plugin(auditPlugin);

AbonoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.__v;
  },
});

module.exports = model("Abono", AbonoSchema);
