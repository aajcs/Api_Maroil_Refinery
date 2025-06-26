const { Resend } = require("resend");

// Inicializa Resend con clave de API
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo usando Resend
 * @param {string|string[]} to - destinatario(s)
 * @param {string} subject - asunto del correo
 * @param {string} html - contenido HTML del correo
 * @returns {Promise<object>} respuesta de Resend
 */
async function sendEmail(to, subject, html) {
  // Validar formato del remitente
  const fromEnv = process.env.EMAIL_FROM;
  const simpleEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const namedEmailRegex = /^.+ <[^@\s]+@[^@\s]+\.[^@\s]+>$/;
  if (!simpleEmailRegex.test(fromEnv) && !namedEmailRegex.test(fromEnv)) {
    throw new Error(
      "Invalid 'EMAIL_FROM' format. Use 'email@example.com' or 'Name <email@example.com>'"
    );
  }
  const response = await resend.emails.send({
    from: fromEnv, // Configurar remitente en .env (validado)
    to,
    subject,
    html,
  });

  console.log("Resend response:", response);
  // Asegurar que se retorne el ID de mensaje
  return { id: response.id || response.messageId, raw: response };
}

module.exports = { sendEmail };
