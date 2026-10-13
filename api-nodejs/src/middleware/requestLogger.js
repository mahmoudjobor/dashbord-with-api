/**
 * Logs ONLY: method, path, status code, response time.
 * Deliberately never touches headers (Authorization) or body, and uses
 * req.path (no query string) so secrets in URLs can't leak either.
 */
function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
}

module.exports = requestLogger;
