// notificationService.js
const admin = require("firebase-admin");
const usuario = require("../models/usuario");
const { notification } = require("../models");
const { sendEmail } = require("../utils/resend");

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Envía notificaciones relacionadas con un nuevo contrato
   * @param {Object} nuevoContrato - El contrato recién creado
   * @param {Object} user - Usuario que creó el contrato
   */
  async sendContractNotifications(nuevoContrato, user) {
    try {
      // 1. Obtener usuarios relevantes
      const usuariosFinanzas = await this.getRelevantUsers(
        nuevoContrato.idRefineria
      );

      // 2. Enviar notificaciones in-app
      const notifications = await this.sendInAppNotifications(
        usuariosFinanzas,
        "Nuevo contrato creado",
        `Se ha creado un nuevo contrato (${nuevoContrato.numeroContrato}) para la refinería ${nuevoContrato.idRefineria.nombre} y el contacto ${nuevoContrato.idContacto.nombre}.`,
        user._id,
        `/contratos/${nuevoContrato._id}`
      );

      // 3. Enviar notificaciones por email
      await this.sendEmailNotifications(
        usuariosFinanzas,
        "Tienes una nueva notificación",
        `Hola {nombre},<br><br>
         Se ha creado un nuevo contrato ${nuevoContrato.numeroContrato}.<br><br>
         <a href="https://tudominio.com/contratos/${nuevoContrato._id}">Ver detalle</a>`,
        nuevoContrato._id
      );

      // 4. Enviar notificaciones push
      await this.sendPushNotifications(
        usuariosFinanzas,
        "Nuevo contrato creado",
        `Contrato ${nuevoContrato.numeroContrato} creado exitosamente.`,
        `/contratos/${nuevoContrato._id}`
      );

      return {
        inApp: notifications.length,
        email: usuariosFinanzas.filter((u) => u.correo).length,
        push: usuariosFinanzas.flatMap((u) => u.fcmTokens || []).length,
      };
    } catch (error) {
      console.error("Error en notificaciones de contrato:", error);
      throw error;
    }
  }

  /**
   * Obtiene usuarios relevantes para notificaciones
   * @param {Object} idRefineria - Refinería asociada
   */
  async getRelevantUsers(idRefineria) {
    return await usuario.find({
      departamento: { $in: ["Finanzas"] },
      eliminado: false,
      $or: [
        { acceso: "completo" },
        { acceso: "limitado", idRefineria: idRefineria },
      ],
    });
  }

  /**
   * Envía notificaciones in-app
   * @param {Array} users - Usuarios a notificar
   * @param {String} title - Título de la notificación
   * @param {String} message - Mensaje de la notificación
   * @param {String} createdBy - ID del usuario creador
   * @param {String} link - Enlace relacionado
   */
  async sendInAppNotifications(users, title, message, createdBy, link = null) {
    const notifications = users.map((user) => ({
      title,
      message,
      type: "in-app",
      createdBy,
      read: false,
      userId: user._id,
      link,
    }));

    const savedNotifications = await notification.insertMany(notifications);

    // Emitir notificaciones en tiempo real
    savedNotifications.forEach((notification) => {
      this.io
        .to(`user-${notification.userId}`)
        .emit("new-notification", notification);
    });

    return savedNotifications;
  }

  /**
   * Envía notificaciones por email
   * @param {Array} users - Usuarios a notificar
   * @param {String} subject - Asunto del email
   * @param {String} htmlTemplate - Plantilla HTML con marcadores {nombre}
   * @param {String} entityId - ID de la entidad relacionada
   */
  async sendEmailNotifications(users, subject, htmlTemplate, entityId) {
    const emailPromises = users
      .filter((user) => user.correo)
      .map(async (user) => {
        try {
          // Personalizar el email
          const personalizedHtml = htmlTemplate
            .replace(/{nombre}/g, user.nombre)
            .replace(/{entityId}/g, entityId);

          const result = await sendEmail(
            user.correo,
            subject,
            personalizedHtml
          );

          return { email: user.correo, success: true, result };
        } catch (error) {
          console.error(`Error al enviar email a ${user.correo}:`, error);
          return { email: user.correo, success: false, error };
        }
      });

    return Promise.all(emailPromises);
  }

  /**
   * Envía notificaciones push
   * @param {Array} users - Usuarios a notificar
   * @param {String} title - Título de la notificación
   * @param {String} body - Cuerpo del mensaje
   * @param {String} link - Enlace relacionado
   */
  async sendPushNotifications(users, title, body, link = null) {
    const tokens = users.flatMap((user) =>
      (user.fcmTokens || []).map((token) => ({ token, userId: user._id }))
    );

    if (tokens.length === 0) return [];

    const messages = tokens.map(({ token, userId }) => ({
      token,
      notification: { title, body },
      webpush: {
        fcmOptions: { link: `https://tudominio.com${link}` },
      },
      data: {
        userId: userId.toString(),
        link,
        type: "contract-notification",
      },
    }));

    try {
      const results = await Promise.all(
        messages.map((msg) => admin.messaging().send(msg))
      );
      return results;
    } catch (error) {
      console.error("Error enviando notificaciones push:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
