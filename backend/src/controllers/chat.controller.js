// backend/src/controllers/chat.controller.js
const apiResponse = require('../utils/apiResponse');
const chatService = require('../services/chat.service');

async function webhookStore(req, res, next) {
  try {
    const payload = req.body;
    if (!payload.message) return apiResponse.error(res, "Invalid payload", 400);

    const result = await chatService.storeIncoming(payload);
    return apiResponse.ok(res, {
      stored: true,
      chatId: result.chat.id,
      messageId: result.message.id
    });
  } catch (err) {
    next(err);
  }
}

async function listChats(req, res, next) {
  try {
    const rows = await chatService.getChats();
    return apiResponse.ok(res, { rows });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const jid = req.params.jid;
    const data = await chatService.getMessagesByJid(jid);
    return apiResponse.ok(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  webhookStore,
  listChats,
  getMessages
};
