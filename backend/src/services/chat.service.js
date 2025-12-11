// backend/src/services/chat.service.js
const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');

async function storeIncoming(payload) {
  const { accountId, message, raw } = payload;
  const jid = message?.jid || message?.remoteJid;
  const text = message?.text || '';

  if (!jid) throw new Error("jid missing");

  const chat = await chatModel.ensureChat(jid, accountId);
  const msg = await messageModel.createMessage({
    chat_id: chat.id,
    sender: 'user',
    direction: 'inbound',
    message: text,
    ts: message?.timestamp || Date.now(),
    raw: raw || message
  });

  return { chat, message: msg };
}

async function storeOutgoing({ jid, text, raw = null }) {
  const chat = await chatModel.ensureChat(jid);
  const msg = await messageModel.createMessage({
    chat_id: chat.id,
    sender: 'assistant',
    direction: 'outbound',
    message: text,
    ts: Date.now(),
    raw
  });

  return { chat, message: msg };
}

async function getChats(limit = 50, offset = 0) {
  return chatModel.listChats(limit, offset);
}

async function getMessagesByJid(jid, limit = 100, offset = 0) {
  const chat = await chatModel.findChatByJid(jid);
  if (!chat) return { chat: null, messages: [] };
  const messages = await messageModel.listMessages(chat.id, limit, offset);
  return { chat, messages };
}

module.exports = {
  storeIncoming,
  storeOutgoing,
  getChats,
  getMessagesByJid
};
