const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(','), methods: ['GET', 'POST', 'PUT'] }));
app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));
app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down' } },
  }),
);

app.use(routes);
app.use(notFound);
app.use(errorHandler); // must be last

module.exports = app;
