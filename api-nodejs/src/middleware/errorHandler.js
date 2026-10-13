const AppError = require('../utils/AppError');

function notFound(_req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

// Express recognises error handlers by their 4 arguments - keep `_next`.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details;

  if (err instanceof AppError) {
    ({ statusCode: status, code, message, details } = err);
  } else if (err && err.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Request body is not valid JSON';
  } else if (err && err.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body is too large';
  }

  if (status >= 500) {
    // Stack goes to the server log only - never to the client.
    console.error(`[error] ${req.method} ${req.path}`, err && err.stack ? err.stack : err);
  }

  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}

module.exports = { notFound, errorHandler };
