const { Schema, model } = require("mongoose");
const auditPlugin = require("./plugins/audit");

const BalanceSchema = new Schema({
  fechaInicio: {
    type: Date,
    required: true,
  },
  fechaFin: {
    type: Date,
    required: true,
  },
  contratosCompras: [
    {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
    },
  ],
  contratosVentas: [
    {
      type: Schema.Types.ObjectId,
      ref: "Contrato",
    },
  ],

     idRefineria: {
      type: Schema.Types.ObjectId,
      ref: "Refineria",
      required: true,
    },

  facturas: [
    {
      type: Schema.Types.ObjectId,
      ref: "Factura",
    },
  ],
  totalCompras: {
    type: Number,
    default: 0,
  },
  totalVentas: {
    type: Number,
    default: 0,
  },
  ganancia: {
    type: Number,
    default: 0,
  },
  perdida: {
    type: Number,
    default: 0,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
  numeroBalance: {
    type: Number,
    unique: true,
  },
     eliminado: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
BalanceSchema.plugin(auditPlugin);

BalanceSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.__v;
  },
});

module.exports = model("Balance", BalanceSchema);
