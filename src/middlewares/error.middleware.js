function errorHandler(error, req, res, next) {
  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  const message =
    statusCode === 500
      ? "Error interno del servidor"
      : error.message || "Error en la solicitud";

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    status: "error",
    message
  });
}

export default errorHandler;