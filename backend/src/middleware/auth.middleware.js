// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ ok: false, message: 'Authorization header missing' });

    const parts = header.split(' ');
    if (parts.length !== 2) return res.status(401).json({ ok: false, message: 'Invalid authorization format' });

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.sub) return res.status(401).json({ ok: false, message: 'Invalid token' });

    // load user basic
    const user = await findUserById(decoded.sub);
    if (!user) return res.status(401).json({ ok: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Authentication failed', error: err.message });
  }
}

module.exports = { authMiddleware };
