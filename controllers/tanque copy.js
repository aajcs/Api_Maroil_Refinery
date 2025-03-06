// const { response, request } = require("express");

// const Tanque = require("../models/tanque");

// const tanqueGets = async (req = request, res = response) => {
//
//   const query = { eliminado: false };

//   const [total, tanques] = await Promise.all([
//     Tanque.countDocuments(query),
//     Tanque.find(query)
//       .skip(Number(desde))
//       .limit(Number(limite))
//       .populate("idRefineria", "nombre"),
//   ]);

//   res.json({
//     total,
//     tanques,
//   });
// };

// const tanqueGet = async (req = request, res = response) => {
//   const { id } = req.params;
//   const tanque = await Tanque.findById(id).populate("idRefineria", "nombre");

//   // Verificar si el campo eliminado es falso
//   if (tanque && !tanque.eliminado) {
//     res.json(tanque);
//   } else {
//     // Enviar una respuesta apropiada si el tanque no existe o está marcado como eliminado
//     res.status(404).json({
//       msg: "Tanque no encontrado o eliminado",
//     });
//   }
// };

// const tanquePost = async (req, res = response) => {
//   const {
//     nombre,
//     ubicacion,
//     capacidad,
//     material,
//     almacenamiento,
//     idRefineria,
//   } = req.body;
//   const tanque = new Tanque({
//     nombre,
//     ubicacion,
//     capacidad,
//     material,
//     almacenamiento,
//     idRefineria,
//   });
//   console.log(tanque);
//   try {
//     // Guardar en BD
//     await tanque.save();
//     await tanque.populate("idRefineria", "nombre").execPopulate();
//     res.json({
//       tanque,
//     });
//   } catch (err) {
//     res.status(400).json({ error: err });
//   }
// };

// const tanquePut = async (req, res = response) => {
//   const { id } = req.params;
//   const { _id, ...resto } = req.body;
//   const tanque = await Tanque.findByIdAndUpdate(id, resto, {
//     new: true,
//   }).populate("idRefineria", "nombre");

//   res.json(tanque);
// };

// const tanqueDelete = async (req, res = response) => {
//   const { id } = req.params;
//   const tanque = await Tanque.findByIdAndUpdate(
//     id,
//     { eliminado: true },
//     { new: true }
//   );

//   res.json(tanque);
// };

// const tanquePatch = (req, res = response) => {
//   res.json({
//     msg: "patch API - usuariosPatch",
//   });
// };

// module.exports = {
//   tanquePost,
//   tanqueGet,
//   tanqueGets,
//   tanquePut,
//   tanqueDelete,
//   tanquePatch,
// };
