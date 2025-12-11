// backend/src/middlewares/internalAuth.middleware.js
module.exports = function internalAuth(req, res, next) {
  const secret = req.headers['x-internal-secret'] || req.headers['x-internal-token'];
  if (!secret || secret !== process.env.INTERNAL_SECRET) {
    return res.status(403).json({ ok: false, error: 'Forbidden (internal)' });
  }
  next();
};
