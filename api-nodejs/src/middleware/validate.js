const AppError = require('../utils/AppError');

/**
 * validate({ body, params, query }) - parses each part with its Zod schema
 * BEFORE the controller runs. Parsed (typed, defaulted, stripped) values are
 * stored on req.validated; raw input is never used by controllers.
 */
const validate = (schemas) => (req, _res, next) => {
  req.validated = req.validated || {};
  for (const part of ['params', 'query', 'body']) {
    const schema = schemas[part];
    if (!schema) continue;
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return next(new AppError(400, 'VALIDATION_ERROR', `Invalid request ${part}`, details));
    }
    req.validated[part] = result.data;
  }
  return next();
};

module.exports = validate;
