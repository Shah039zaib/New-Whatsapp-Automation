// backend/src/controllers/order.controller.js
const apiResponse = require('../utils/apiResponse');
const orderService = require('../services/order.service');

async function createFromChat(req, res, next) {
  try {
    // admin-create via auth middleware (existing)
    const { jid, user_id, items, metadata, external_order_id } = req.body;
    if (!jid || !Array.isArray(items) || items.length === 0) {
      return apiResponse.error(res, 'jid and items required', 400);
    }
    const order = await orderService.createOrderFromChat({ jid, user_id, items, metadata, external_order_id });
    return apiResponse.ok(res, { order });
  } catch (err) {
    next(err);
  }
}

// Internal endpoint (called by WA service) — protected by x-internal-secret
async function createFromChatInternal(req, res, next) {
  try {
    const { jid, items, metadata, external_order_id } = req.body;
    if (!jid || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'jid and items required' });
    }
    const order = await orderService.createOrderFromChat({ jid, items, metadata, external_order_id });
    return res.json({ ok: true, order });
  } catch (err) {
    next(err);
  }
}

async function setStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    const result = await orderService.setOrderStatus(Number(orderId), status, note, req.user?.id || null);
    return apiResponse.ok(res, { result });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { orderId } = req.params;
    const data = await orderService.getOrder(Number(orderId));
    if (!data) return apiResponse.error(res, 'Order not found', 404);
    return apiResponse.ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const rows = await orderService.listOrders(limit, offset);
    return apiResponse.ok(res, { rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { createFromChat, createFromChatInternal, setStatus, getOne, list };
