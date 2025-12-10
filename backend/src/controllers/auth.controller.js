// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const apiResponse = require('../utils/apiResponse');
const { createUser, findUserByEmail, findUserById } = require('../models/user.model');
const { sign } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return apiResponse.error(res, 'Email and password required', 400);

    const existing = await findUserByEmail(email);
    if (existing) return apiResponse.error(res, 'User already exists', 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password: hashed });
    return apiResponse.ok(res, { user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return apiResponse.error(res, 'Email and password required', 400);

    const user = await findUserByEmail(email);
    if (!user) return apiResponse.error(res, 'Invalid credentials', 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return apiResponse.error(res, 'Invalid credentials', 401);

    const token = sign({ sub: user.id, email: user.email });
    return apiResponse.ok(res, { token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  return apiResponse.ok(res, { user: req.user });
}

module.exports = { register, login, me };
