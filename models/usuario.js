const { Schema, model } = require("mongoose");
const auditPlugin = require("./plugins/audit");

const UsuarioSchema = Schema(
  {
    idRefineria: [
      {
        type: Schema.Types.ObjectId,
        ref: "Refineria",
      },
    ],
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },

    rol: {
      type: String,
      required: true,
      default: "lectura",
      enum: ["superAdmin", "admin", "operador", "user", "lectura"],
    },
    departamento: [
      {
        type: String,
        required: true,
      },
    ],

    acceso: {
      type: String,
      required: true,
      default: "ninguno",
      enum: ["limitado", "completo", "ninguno"],
    },
    estado: {
      type: String,
      default: true,
    },
    eliminado: {
      type: Boolean,
      default: false,
    },
    online: {
      type: Boolean,
      default: false,
    },
    // Tokens de notificaciones push para FCM
    fcmTokens: {
      type: [String],
      default: [],
    },
    /* google: {
        type: Boolean,
        default: false
    },*/
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
UsuarioSchema.plugin(auditPlugin);

UsuarioSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  },
});

module.exports = model("Usuario", UsuarioSchema);
