// whatsapp/utils/messageParser.js
// Robust parser: returns canonical fields used by handlers.
// Fields: { id, jid, fromMe, timestamp, messageType, text, hasMedia, raw }

function safeGet(obj, pathArr) {
  return pathArr.reduce((acc, k) => (acc && acc[k] !== undefined) ? acc[k] : null, obj);
}

function parseMessage(upsert) {
  try {
    // Baileys messages.upsert can have shape: { messages: [msg], type: 'append' } or direct msg
    const msg = Array.isArray(upsert?.messages) ? upsert.messages[0] : upsert;
    const key = msg?.key || {};
    const jid = key.remoteJid || null;
    const id = key.id || (msg?.message?.conversation ? `msg-${Date.now()}` : null);
    const fromMe = !!key.fromMe;
    const timestamp = Number(msg?.messageTimestamp) || Number(safeGet(msg, ['message','contextInfo','expiration'])) || Date.now();

    const messageObj = msg?.message || {};
    const messageType = Object.keys(messageObj)[0] || null;

    // extract text/caption
    let text = '';
    if (messageType === 'conversation') text = messageObj.conversation;
    else if (messageType === 'extendedTextMessage') text = messageObj.extendedTextMessage?.text || '';
    else if (messageType === 'imageMessage') text = messageObj.imageMessage?.caption || '';
    else if (messageType === 'videoMessage') text = messageObj.videoMessage?.caption || '';
    else if (messageType === 'documentMessage') text = messageObj.documentMessage?.caption || '';
    else if (messageType === 'buttonsResponseMessage') text = messageObj.buttonsResponseMessage?.selectedButtonId || messageObj.buttonsResponseMessage?.selectedDisplayText || '';
    else if (messageType === 'templateButtonReplyMessage') text = messageObj.templateButtonReplyMessage?.selectedId || messageObj.templateButtonReplyMessage?.selectedDisplayText || '';
    else text = '';

    const hasMedia = ['imageMessage','videoMessage','documentMessage','audioMessage','stickerMessage'].includes(messageType);

    return {
      id,
      jid,
      fromMe,
      timestamp,
      messageType,
      text: text ? String(text).trim() : '',
      hasMedia,
      raw: msg
    };
  } catch (err) {
    return { id: null, jid: null, fromMe: false, timestamp: Date.now(), messageType: null, text: '', hasMedia: false, raw: upsert };
  }
}

module.exports = { parseMessage };
