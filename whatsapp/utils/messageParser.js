// whatsapp/utils/messageParser.js
// Extract canonical text & media info from Baileys message object

function parseMessage(m) {
  try {
    const msg = m.messages?.[0] || m; // depending on upsert shape
    const key = msg.key || {};
    const remoteJid = key.remoteJid;
    const id = key.id;
    const fromMe = key.fromMe;
    const timestamp = (msg.messageTimestamp && Number(msg.messageTimestamp)) || (msg.message && msg.message.timestamp) || Date.now();

    // text extraction
    const messageType = Object.keys(msg.message || {})[0];
    let text = '';
    if (messageType === 'conversation') text = msg.message.conversation;
    else if (messageType === 'extendedTextMessage') text = msg.message.extendedTextMessage?.text || '';
    else if (messageType === 'imageMessage') text = msg.message.imageMessage?.caption || '';
    else if (messageType === 'videoMessage') text = msg.message.videoMessage?.caption || '';
    else if (messageType === 'documentMessage') text = msg.message.documentMessage?.caption || '';
    else text = '';

    // media meta
    const hasMedia = ['imageMessage','videoMessage','documentMessage','audioMessage','stickerMessage'].includes(messageType);

    return { id, remoteJid, fromMe, timestamp, messageType, text, hasMedia, raw: msg };
  } catch (err) {
    return { id: null, remoteJid: null, text: '', messageType: null, hasMedia: false, raw: m };
  }
}

module.exports = { parseMessage };
