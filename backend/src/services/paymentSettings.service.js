// backend/src/services/paymentSettings.service.js
const model = require('../models/paymentSettings.model');

module.exports = {
  getSettings: () => model.getSettings(),
  updateSettings: (data) => model.updateSettings(data)
};
