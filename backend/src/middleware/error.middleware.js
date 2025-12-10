// backend/src/middlewares/error.middleware.js
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const apiResponse = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  logger.error({ err, url: req.originalUrl }, 'Unhandled error');
  const status = err.status || 500;
  const message = err.message || 'Server error';
  return apiResponse.error(res, message, status, { details: err.details || null });
}

module.exports = { errorHandler };
