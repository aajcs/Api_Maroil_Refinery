const { response, request } = require("express");
const Notification = require("../models/notification");

// Opciones de población reutilizables para consultas
const populateOptions = [
  { path: "createdBy", select: "nombre correo" },
  {
    path: "historial",
    populate: { path: "modificadoPor", select: "nombre correo" },
  },
];

// Controlador para obtener todas las notificaciones
const notificationsGets = async (req = request, res = response, next) => {
  try {
    const notifications = await Notification.find({
      eliminado: false,
    }).populate(populateOptions);
    res.json({
      total: notifications.length,
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

// Controlador para obtener una notificación específica por ID
const notificationsGet = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOne({
      _id: id,
      eliminado: false,
    }).populate(populateOptions);

    if (!notification) {
      return res.status(404).json({ msg: "Notificación no encontrada" });
    }

    res.json(notification);
  } catch (err) {
    next(err);
  }
};

const notificationsByUser = async (req = request, res = response, next) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({
      userId,
      eliminado: false,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate(populateOptions);

    res.json({
      total: notifications.length,
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

// Controlador para crear una nueva notificación
const notificationsPost = async (req = request, res = response, next) => {
  const { title, message, userId, type, read, link } = req.body;

  try {
    const newNotification = new Notification({
      title,
      message,
      userId,
      type: type || "in-app", // Default to "in-app" if not provided
      read: read || false, // Default to false if not provided
      link,
      createdBy: req.usuario._id,
    });

    await newNotification.save();
    req.io.emit("new-notification", newNotification); // Emite un evento de WebSocket para notificar la modificación
    res.status(201).json(newNotification);
  } catch (err) {
    next(err);
  }
};

// Controlador para actualizar una notificación existente
const notificationsPut = async (req = request, res = response, next) => {
  const { id } = req.params;
  const { _id, ...resto } = req.body;

  try {
    const notificationUpdated = await Notification.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        ...resto,
        $push: {
          historial: { modificadoPor: req.usuario._id, cambios: resto },
        },
      },
      { new: true }
    ).populate(populateOptions);

    if (!notificationUpdated) {
      return res.status(404).json({ msg: "Notificación no encontrada" });
    }

    res.json(notificationUpdated);
  } catch (err) {
    next(err);
  }
};

// Controlador para eliminar una notificación
const notificationsDelete = async (req = request, res = response, next) => {
  const { id } = req.params;

  try {
    const notificationDeleted = await Notification.findOneAndUpdate(
      { _id: id, eliminado: false },
      {
        eliminado: true,
        $push: {
          historial: {
            modificadoPor: req.usuario._id,
            cambios: { eliminado: true },
          },
        },
      },
      { new: true }
    );

    if (!notificationDeleted) {
      return res.status(404).json({ msg: "Notificación no encontrada" });
    }

    res.json({ msg: "Notificación eliminada correctamente" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  notificationsGets,
  notificationsGet,
  notificationsPost,
  notificationsPut,
  notificationsDelete,
  notificationsByUser,
};
