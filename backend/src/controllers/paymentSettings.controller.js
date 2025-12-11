// backend/src/controllers/paymentSettings.controller.js
const service = require('../services/paymentSettings.service');
const api = require('../utils/apiResponse');

module.exports = {
  async get(req, res, next) {
    try {
      const settings = await service.getSettings();
      return api.ok(res, { settings });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const updated = await service.updateSettings(req.body);
      return api.ok(res, { updated });
    } catch (err) { next(err); }
  }
};
