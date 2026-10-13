const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/** Verifies "Authorization: Bearer <jwt>". Missing/invalid/expired -> 401. */
function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing or malformed Authorization header'));
  }
  const token = header.slice('Bearer '.length).trim();

  try {
    // Pin the algorithm so "alg: none" / algorithm-confusion tokens are rejected.
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: String(payload.sub ?? 'unknown'), role: payload.role === 'admin' ? 'admin' : 'viewer' };
    return next();
  } catch {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
}

/** Authenticated but not allowed -> 403. */
const requireRole = (role) => (req, _res, next) =>
  req.user && req.user.role === role
    ? next()
    : next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));

module.exports = { authenticate, requireRole };
