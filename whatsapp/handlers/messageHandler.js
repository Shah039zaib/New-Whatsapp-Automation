// whatsapp/handlers/messageHandler.js
const axios = require('axios');
const EventEmitter = require('eventemitter3');
const { parseMessage } = require('../utils/messageParser');
const { saveMedia } = require('./mediaHandler');

const emitter = new EventEmitter(); // events: 'message' (payload), 'mediaSaved'

async function onMessageUpsert(conn, m, accountId, logger) {
  try {
    const parsed = parseMessage(m);
    logger.info({ accountId, parsed }, 'incoming-message');

    // Emit local event so backend service can subscribe
    emitter.emit('message', { accountId, message: parsed, raw: m });

    // If media, save and emit
    if (parsed.hasMedia) {
      try {
        const mediaInfo = await saveMedia(conn, parsed.raw, parsed.id || 'media');
        emitter.emit('mediaSaved', { accountId, message: parsed, media: mediaInfo });
      } catch (err) {
        logger.error({ err }, 'media save failed');
      }
    }

    // Optionally POST to backend webhook (non-blocking)
    const webhook = process.env.BACKEND_WEBHOOK_URL;
    if (webhook) {
      axios.post(webhook, { accountId, message: parsed }).catch(e => {
        logger.warn({ err: e && e.message }, 'webhook post failed');
      });
    }
  } catch (err) {
    logger.error(err, 'onMessageUpsert error');
  }
}

module.exports = { onMessageUpsert, emitter };
