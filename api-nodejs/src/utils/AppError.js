class AppError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} code machine-readable error code
   * @param {string} message safe, client-facing message
   * @param {unknown} [details] optional safe details (e.g. validation issues)
   */
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

module.exports = AppError;
