// backend/src/controllers/analytics.controller.js
const apiResponse = require('../utils/apiResponse');
const { getConversationsCount, getSalesSummary } = require('../services/analytics.service');

async function getOverview(req, res, next) {
  try {
    const conv = await getConversationsCount();
    const sales = await getSalesSummary();
    return apiResponse.ok(res, { conversations: conv, sales });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOverview };
