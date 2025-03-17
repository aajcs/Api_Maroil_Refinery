const { response, request } = require("express");
const bcryptjs = require("bcryptjs");

const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers");

const usuariosGets = async (req = request, res = response) => {
  const query = { eliminado: false };

  const [total, usuarios] = await Promise.all([
    Usuario.countDocuments(query),
    Usuario.find(query),
  ]);

  res.json({
    total,
    usuarios,
  });
};

const usuariosGet = async (req = request, res = response) => {
  const { id } = req.params;
  const usuario = await Usuario.findById(id);

  // Verificar si el campo eliminado es falso
  if (usuario && !usuario.eliminado) {
    res.json(usuario);
  } else {
    // Enviar una respuesta apropiada si el usuario no existe o está marcado como eliminado
    res.status(404).json({
      msg: "Usuario no encontrado o eliminado",
    });
  }
};

const usuariosPost = async (req, res = response) => {
  const { nombre, correo, password, rol, estado, acceso, idRefineria } =
    req.body;
  const usuario = new Usuario({
    idRefineria,
    nombre,
    correo,
    password,
    rol,
    acceso,
    estado,
  });
  try {
    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    // Guardar en BD
    await usuario.save();

    // Generar el JWT
    const token = await generarJWT(usuario.id);

    res.json({
      usuario,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const usuariosPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, password, correo, ...resto } = req.body;
  if (password) {
    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    resto.password = bcryptjs.hashSync(password, salt);
  }

  const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

  res.json(usuario);
};

const usuariosPatch = (req, res = response) => {
  res.json({
    msg: "patch API - usuariosPatch",
  });
};

const usuariosDelete = async (req, res = response) => {
  const { id } = req.params;
  const usuario = await Usuario.findByIdAndUpdate(
    id,
    { eliminado: true },
    { new: true }
  );

  res.json(usuario);
};

module.exports = {
  usuariosGets,
  usuariosPost,
  usuariosPut,
  usuariosPatch,
  usuariosDelete,
  usuariosGet,
};
