// notificationService.js
const admin = require("firebase-admin");
const usuario = require("../models/usuario");
const { notification } = require("../models");
const { sendEmail } = require("../utils/resend");
// const pLimit = require("p-limit");

class NotificationService {
  constructor(io) {
    this.io = io;
  }
  /**
   * Orquesta y despacha notificaciones a través de múltiples canales.
   * Se ejecuta en segundo plano para no bloquear la respuesta al cliente.
   * @param {Object} config - Configuración de la notificación.
   * @param {Array} config.users - Array de objetos de usuario a notificar.
   * @param {Object} config.triggeringUser - El usuario que originó el evento.
   * @param {Object} [config.channels] - Canales a utilizar.
   * @param {Object} [config.channels.inApp] - Configuración para notificaciones in-app.
   * @param {Object} [config.channels.email] - Configuración para emails.
   * @param {Object} [config.channels.push] - Configuración para notificaciones push.
   */
  /**
  //  * Envía notificaciones relacionadas con un nuevo contrato
  //  * @param {Object} nuevoContrato - El contrato recién creado
  //  * @param {Object} user - Usuario que creó el contrato
  //  */
  // async sendContractNotifications(nuevoContrato, user) {
  //   try {
  //     // 1. Obtener usuarios relevantes
  //     const usuariosFinanzas = await this.getRelevantUsers(
  //       nuevoContrato.idRefineria
  //     );

  //     // 2. Enviar notificaciones in-app
  //     const notifications = await this.sendInAppNotifications(
  //       usuariosFinanzas,
  //       "Nuevo contrato creado",
  //       `Se ha creado un nuevo contrato (${nuevoContrato.numeroContrato}) para la refinería ${nuevoContrato.idRefineria.nombre} y el contacto ${nuevoContrato.idContacto.nombre}.`,
  //       user._id,
  //       `/contratos/${nuevoContrato._id}`
  //     );

  //     // // 3. Enviar notificaciones por email
  //     // this.sendEmailNotifications(
  //     //   usuariosFinanzas,
  //     //   "Tienes una nueva notificación",
  //     //   `Hola {nombre},<br><br>
  //     //    Se ha creado un nuevo contrato ${nuevoContrato.numeroContrato}.<br><br>
  //     //    <a href="https://tudominio.com/contratos/${nuevoContrato._id}">Ver detalle</a>`,
  //     //   nuevoContrato._id
  //     // );

  //     // 4. Enviar notificaciones push
  //     this.sendPushNotifications(
  //       usuariosFinanzas,
  //       "Nuevo contrato creado",
  //       `Contrato ${nuevoContrato.numeroContrato} creado exitosamente.`,
  //       `/refineria/finanzas/contrato-compra`
  //     );

  //     return {
  //       inApp: notifications.length,
  //       email: usuariosFinanzas.filter((u) => u.correo).length,
  //       push: usuariosFinanzas.flatMap((u) => u.fcmTokens || []).length,
  //     };
  //   } catch (error) {
  //     console.error("Error en notificaciones de contrato:", error);
  //     throw error;
  //   }
  // }
  dispatch({ users, triggeringUser, channels = {} }) {
    // "Fire-and-forget": Ejecuta todo en segundo plano.
    (async () => {
      try {
        if (!users || users.length === 0) {
          console.log("[NotificationService] No hay usuarios para notificar.");
          return;
        }

        // Deduplicar usuarios para asegurar que no haya envíos dobles
        const uniqueUsers = Array.from(
          new Map(users.map((user) => [user._id.toString(), user])).values()
        );

        if (channels.inApp) {
          await this._sendInApp(uniqueUsers, triggeringUser, channels.inApp);
        }
        if (channels.email) {
          await this._sendEmails(uniqueUsers, channels.email);
        }
        if (channels.push) {
          await this._sendPush(uniqueUsers, channels.push);
        }
      } catch (error) {
        console.error(
          "[NotificationService] Error en el despacho en segundo plano:",
          error
        );
      }
    })();
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
  // async sendInAppNotifications(users, title, message, createdBy, link = null) {
  //   const notifications = users.map((user) => ({
  //     title,
  //     message,
  //     type: "in-app",
  //     createdBy,
  //     read: false,
  //     userId: user._id,
  //     link,
  //   }));

  //   const savedNotifications = await notification.insertMany(notifications);

  //   // Emitir notificaciones en tiempo real
  //   savedNotifications.forEach((notification) => {
  //     this.io
  //       .to(`user-${notification.userId}`)
  //       .emit("new-notification", notification);
  //   });

  //   return savedNotifications;
  // }
  async _sendInApp(users, triggeringUser, { title, message, link }) {
    const notifications = users.map((user) => ({
      title,
      message,
      type: "in-app",
      createdBy: triggeringUser._id,
      read: false,
      userId: user._id,
      link,
    }));

    const saved = await notification.insertMany(notifications);
    saved.forEach((n) =>
      this.io.to(`user-${n.userId}`).emit("new-notification", n)
    );
  }
  /**
   * Envía notificaciones por email
   * @param {Array} users - Usuarios a notificar
   * @param {String} subject - Asunto del email
   * @param {String} htmlTemplate - Plantilla HTML con marcadores {nombre}
   * @param {String} entityId - ID de la entidad relacionada
   */
  // async sendEmailNotifications(users, subject, htmlTemplate, entityId) {
  //   const results = [];
  //   const usersWithEmail = users.filter((user) => user.correo);

  //   for (const user of usersWithEmail) {
  //     try {
  //       // Personalizar y enviar el email
  //       console.log(`Enviando email a ${user.correo}...`);
  //       const personalizedHtml = htmlTemplate
  //         .replace(/{nombre}/g, user.nombre)
  //         .replace(/{entityId}/g, entityId);

  //       const result = await sendEmail(user.correo, subject, personalizedHtml);
  //       results.push({ email: user.correo, success: true, result });
  //     } catch (error) {
  //       console.error(`Error al enviar email a ${user.correo}:`, error);
  //       results.push({ email: user.correo, success: false, error });
  //     }

  //     // Pausa de 500ms para no exceder el límite de 2 req/s
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  //   }

  //   return results;
  // }

  // /**
  //  * Envía notificaciones push
  //  * @param {Array} users - Usuarios a notificar
  //  * @param {String} title - Título de la notificación
  //  * @param {String} body - Cuerpo del mensaje
  //  * @param {String} link - Enlace relacionado
  //  */
  // async sendPushNotifications(users, title, body, link = null) {
  //   const tokens = users.flatMap((user) =>
  //     (user.fcmTokens || []).map((token) => ({ token, userId: user._id }))
  //   );

  //   if (tokens.length === 0) return [];

  //   const messages = tokens.map(({ token, userId }) => ({
  //     token,
  //     notification: {
  //       title,
  //       body,
  //       imageUrl: `${process.env.BACKEND_URL}/images/logoMaroil.png`, // URL dinámica
  //     },
  //     webpush: {
  //       fcmOptions: {
  //         link: `https://maroil-refinery.vercel.app${link}`,
  //       },
  //       notification: {
  //         icon: `${process.env.BACKEND_URL}/images/logoMaroil.png`, // Icono para web
  //         badge: `${process.env.BACKEND_URL}/images/logoMaroil.png`, // Badge para móvil
  //         vibrate: [200, 100, 200], // Patrón de vibración
  //         actions: [
  //           // Acciones rápidas
  //           {
  //             action: "open_link",
  //             title: "Ver más",
  //           },
  //         ],
  //       },
  //     },
  //     data: {
  //       userId: userId.toString(),
  //       link,
  //       type: "contract-notification",
  //     },
  //   }));

  //   try {
  //     const results = await Promise.all(
  //       messages.map((msg) => admin.messaging().send(msg))
  //     );
  //     return results;
  //   } catch (error) {
  //     console.error("Error enviando notificaciones push:");
  //   }
  // }
  async _sendEmails(users, { subject, htmlTemplate, context = {} }) {
    for (const user of users) {
      if (user.correo) {
        try {
          let personalizedHtml = htmlTemplate.replace(/{nombre}/g, user.nombre);
          // Reemplazar otros placeholders del contexto
          for (const key in context) {
            personalizedHtml = personalizedHtml.replace(
              new RegExp(`{${key}}`, "g"),
              context[key]
            );
          }
          await sendEmail(user.correo, subject, personalizedHtml);
        } catch (error) {
          console.error(`Error enviando email a ${user.correo}:`, error);
        }
        await new Promise((resolve) => setTimeout(resolve, 500)); // Respetar rate limit
      }
    }
  }
  /**
   * Envía notificaciones push
   * @param {Array} users - Usuarios a notificar
   * @param {String} title - Título de la notificación
   * @param {String} body - Cuerpo del mensaje
   * @param {String} link - Enlace relacionado
   */
  // async sendPushNotifications(users, { title, body, link }) {
  //   // Aquí va la lógica completa de tu método sendPushNotifications,
  //   // incluyendo la auditoría y limpieza de tokens.
  //   // (Se omite por brevedad, pero es el mismo código que ya tienes)
  //   console.log(
  //     `[Push] Enviando a ${users.length} usuarios: ${title} - ${body}`
  //   );
  // }

  async _sendPush(users, { title, body, link }) {
    // --- Auditoría y Deduplicación ---
    console.log(
      `[Push Audit] Iniciando envío. Recibidos ${users.length} usuarios.`
    );

    // 1. Deduplicar la lista de usuarios para evitar envíos múltiples al mismo usuario.
    const uniqueUsersMap = new Map(
      users.map((user) => [user._id.toString(), user])
    );
    const uniqueUsers = Array.from(uniqueUsersMap.values());

    if (users.length !== uniqueUsers.length) {
      console.warn(
        `[Push Audit] Se encontraron ${
          users.length - uniqueUsers.length
        } usuarios duplicados. Se procesarán ${uniqueUsers.length} usuarios únicos.`
      );
    }

    // 2. Extraer tokens de los usuarios únicos.
    const tokensWithContext = uniqueUsers.flatMap((user) =>
      (user.fcmTokens || []).map((token) => ({
        token,
        userId: user._id.toString(),
      }))
    );

    if (tokensWithContext.length === 0) {
      console.log("[Push Audit] No hay tokens de FCM para enviar.");
      return [];
    }

    console.log(
      `[Push Audit] Preparando ${
        tokensWithContext.length
      } notificaciones para los tokens:`,
      tokensWithContext.map((t) => t.token)
    );

    // --- Construcción de Mensajes ---
    const messages = tokensWithContext.map(({ token, userId }) => ({
      token,
      notification: {
        title,
        body,
        imageUrl: `${process.env.BACKEND_URL}/images/logoMaroil.png`, // URL dinámica
      },
      webpush: {
        fcmOptions: {
          link: `https://maroil-refinery.vercel.app${link}`,
        },
        notification: {
          icon: `${process.env.BACKEND_URL}/images/logoMaroil.png`, // Icono para web
          badge: `${process.env.BACKEND_URL}/images/logoMaroil.png`, // Badge para móvil
          vibrate: [200, 100, 200], // Patrón de vibración
          actions: [
            {
              action: "open_link",
              title: "Ver más",
            },
          ],
        },
      },
      data: {
        userId: userId.toString(),
        link,
        type: "contract-notification",
      },
    }));

    // --- Envío y Manejo de Resultados ---
    try {
      // Usamos Promise.allSettled para procesar todos los envíos incluso si algunos fallan.
      const results = await Promise.allSettled(
        messages.map((msg) => admin.messaging().send(msg))
      );

      results.forEach((result, index) => {
        const tokenInfo = tokensWithContext[index];
        if (result.status === "fulfilled") {
          console.log(
            `[Push Audit] Éxito en envío a token ${tokenInfo.token} (Usuario: ${tokenInfo.userId})`
          );
        } else {
          // Auditoría de errores
          console.error(
            `[Push Audit] Falló el envío al token ${tokenInfo.token} (Usuario: ${tokenInfo.userId}):`,
            result.reason.message
          );

          // Lógica para limpiar tokens inválidos
          const errorCode = result.reason.code;
          if (
            errorCode === "messaging/registration-token-not-registered" ||
            errorCode === "messaging/invalid-registration-token"
          ) {
            console.warn(
              `[Push Cleanup] El token ${tokenInfo.token} es inválido. Se recomienda eliminarlo del usuario ${tokenInfo.userId}.`
            );
            // Descomenta la siguiente línea para eliminar automáticamente los tokens inválidos:
            // usuario.updateOne({ _id: tokenInfo.userId }, { $pull: { fcmTokens: tokenInfo.token } }).exec();
          }
        }
      });

      return results;
    } catch (error) {
      console.error(
        "Error inesperado durante el proceso de envío de notificaciones push:",
        error
      );
    }
  }
}

module.exports = NotificationService;
