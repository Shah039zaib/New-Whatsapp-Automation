// backend/src/services/order.service.js
const orderModel = require('../models/order.model');
const orderItemModel = require('../models/orderItem.model');
const chatService = require('./chat.service');
const pkgModel = require('../models/package.model'); // ensure path exists

async function resolvePackagePrice(titleOrSlug) {
  if (!titleOrSlug) return null;
  // try slug then title
  let pkg = await pkgModel.findPackageBySlug(titleOrSlug).catch(()=>null);
  if (!pkg) {
    // try by title case-insensitive
    const pool = require('../config/db').getPool();
    const res = await pool.query('SELECT * FROM packages WHERE lower(title) = $1 LIMIT 1', [String(titleOrSlug).toLowerCase()]);
    pkg = res.rows[0] || null;
  }
  return pkg;
}

async function createOrderFromChat({ jid, user_id = null, items = [], metadata = {}, external_order_id = null }) {
  // ensure chat exists
  const { chat } = await chatService.storeIncoming({ accountId: null, message: { jid, text: null }, raw: null }).catch(()=>({ chat: null }));
  const chatId = chat?.id || null;

  // resolve items and compute total
  let total = 0;
  const resolvedItems = [];

  for (const it of items) {
    let unit_price = Number(it.unit_price || 0);
    let title = it.title || it.product_id || null;

    if ((!unit_price || unit_price === 0) && title) {
      // try resolve package by title/slug
      const pkg = await resolvePackagePrice(title);
      if (pkg) {
        unit_price = Number(pkg.price || 0);
        title = pkg.title;
      }
    }

    const q = Number(it.quantity || 1);
    total += q * unit_price;

    resolvedItems.push({ title, product_id: it.product_id || null, quantity: q, unit_price });
  }

  const order = await orderModel.createOrder({
    user_id,
    total,
    status: 'pending',
    metadata,
    chat_id: chatId,
    external_order_id
  });

  for (const ri of resolvedItems) {
    await orderItemModel.createOrderItem({
      order_id: order.id,
      product_id: ri.product_id,
      title: ri.title,
      quantity: ri.quantity,
      unit_price: ri.unit_price,
      metadata: {}
    });
  }

  await orderModel.updateOrderStatus(order.id, 'pending', 'Order created from chat');

  return order;
}

async function setOrderStatus(orderId, status, note = null, changedBy = null) {
  return orderModel.updateOrderStatus(orderId, status, note, changedBy);
}

async function getOrder(orderId) {
  const order = await orderModel.getOrderById(orderId);
  if (!order) return null;
  const items = await orderItemModel.listOrderItems(orderId);
  return { order, items };
}

async function listOrders(limit = 50, offset = 0) {
  return orderModel.listOrders(limit, offset);
}

module.exports = { createOrderFromChat, setOrderStatus, getOrder, listOrders };
