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
      default: "lectura",
      enum: ["superAdmin", "admin", "operador", "user", "lectura"],
    },
    estado: {
      type: String,
      default: true,
    },
    eliminado: {
      type: Boolean,
      default: false,
    },

    /* google: {
        type: Boolean,
        default: false
    },*/
    acceso: {
      type: String,
      required: true,
      default: "ninguno",
      enum: ["limitado", "completo", "ninguno"],
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
