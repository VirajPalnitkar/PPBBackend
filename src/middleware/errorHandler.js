const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const error = err.name || 'ServerError';

  res.status(statusCode).json({
    error: error,
    message: message,
    status: statusCode,
  });
};

module.exports = errorHandler;