const { Schema, model } = require("mongoose");

const ContactoSchema = new Schema({
  id_refineria: {
    type: Schema.Types.ObjectId,
    ref: "Refineria",
    required: false,
  },
  nombre: { type: String, required: false },
  ubicacion: { type: String, required: false },
  infoContacto: {
    telefono: { type: String, required: false },
    email: { type: String, required: false },
    direccion: { type: String, required: false },
  },
  tipo: {
    type: String,
    enum: ["cliente", "proveedor"],
    required: [false, "Seleccione que tipo de contacto es"],
  },
  cuentasBancarias: [
    {
      banco: { type: String, required: false },
      numeroCuenta: { type: String, required: false },
      tipoCuenta: {
        type: String,
        enum: ["Ahorro", "Corriente"],
        required: false,
      },
    },
  ],
  cuentasPorPagar: [
    {
      monto: { type: Number, required: false },
      fechaVencimiento: { type: Date, required: false },
      estado: { type: String, enum: ["Pendiente", "Pagada"], required: false },
    },
  ],
  cuentasPorCobrar: [
    {
      monto: { type: Number, required: false },
      fechaVencimiento: { type: Date, required: false },
      estado: { type: String, enum: ["Pendiente", "Cobrada"], required: false },
    },
  ],
  compras: [
    {
      contrato: {
        type: Schema.Types.ObjectId,
        ref: "Contrato",
        required: false,
      },
      fechaCompra: { type: Date, required: false },
      cantidad: { type: Number, required: false },
      precioUnitario: { type: Number, required: false },
      total: { type: Number, required: false },
    },
  ],
  ventas: [
    {
      contrato: { type: Schema.Types.ObjectId, ref: "Contrato" },
      fechaVenta: { type: Date },
      cantidad: { type: Number },
      precioUnitario: { type: Number },
      total: { type: Number },
    },
  ],
  historialModificaciones: [
    {
      campoModificado: { type: String },
      valorAnterior: { type: Schema.Types.Mixed },
      valorNuevo: { type: Schema.Types.Mixed },
      fechaModificacion: { type: Date, default: Date.now },
    },
  ],
  estado: {
    type: String,
    default: true,
  },
  eliminado: {
    type: Boolean,
    default: false,
  },
});

ContactoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = model("Contacto", ContactoSchema);
