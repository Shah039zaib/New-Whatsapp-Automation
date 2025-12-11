// backend/src/services/order.service.js
const orderModel = require('../models/order.model');
const orderItemModel = require('../models/orderItem.model');
const chatService = require('./chat.service'); // uses previously created chat.service

/**
 * createOrderFromChat
 * payload example:
 * {
 *   jid: "923xxxxxxxxx@s.whatsapp.net",
 *   user_id: 1, // optional (admin/user)
 *   items: [{ product_id, title, quantity, unit_price }]
 *   metadata: { ... }
 * }
 */
async function createOrderFromChat({ jid, user_id = null, items = [], metadata = {}, external_order_id = null }) {
  // ensure chat exists and get chat
  const { chat } = await chatService.storeIncoming({ accountId: null, message: { jid, text: null }, raw: null }).catch(()=>({ chat: null }));
  const chatId = chat?.id || null;

  // compute total
  let total = 0;
  for (const it of items) {
    const q = Number(it.quantity || 1);
    const p = Number(it.unit_price || 0);
    total += q * p;
  }

  const order = await orderModel.createOrder({
    user_id,
    total,
    status: 'pending',
    metadata,
    chat_id: chatId,
    external_order_id
  });

  // insert items
  for (const it of items) {
    await orderItemModel.createOrderItem({
      order_id: order.id,
      product_id: it.product_id || null,
      title: it.title || null,
      quantity: it.quantity || 1,
      unit_price: it.unit_price || 0,
      metadata: it.metadata || {}
    });
  }

  // add initial status history
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
