const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema(
  {
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
      default: "USER_ROLE",
      enum: ["ADMIN_ROLE", "USER_ROLE"],
    },
    estado: {
      type: String,
      default: true,
    },
    /* google: {
        type: Boolean,
        default: false
    },*/
    acceso: {
      type: String,
      required: true,
      default: "ACCESS_LIMIT",
      enum: ["ACCESS_LIMIT", "FULL_ACCESS"],
    },
    id_refineria: [
      {
        type: Schema.Types.ObjectId,
        ref: "Refineria",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UsuarioSchema.methods.toJSON = function () {
  const { __v, password, _id, ...usuario } = this.toObject();
  usuario.id = _id;
  return usuario;
};

module.exports = model("Usuario", UsuarioSchema);
