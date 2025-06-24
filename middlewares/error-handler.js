// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  // Manejo específico de errores de MongoDB
  if (err.code === 11000 && err.keyPattern && err.keyPattern.correo) {
    return res.status(400).json({
      success: false,
      error: {
        status: 400,
        message:
          "El correo ya está registrado. Por favor, use un correo diferente.",
      },
    });
  }

  // Formato de respuesta para errores generales
  const errorResponse = {
    success: false,
    error: {
      status: statusCode,
      message,
    },
  };

  // Desarrollo: incluye detalles adicionales
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
