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
});
BalanceSchema.plugin(auditPlugin);

module.exports = model("Balance", BalanceSchema);
