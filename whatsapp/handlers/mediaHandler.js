// whatsapp/handlers/mediaHandler.js
const { existsSync, ensureDirSync } = require('fs-extra');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const { downloadContentFromMessage } = require('@adiwajshing/baileys');

const MEDIA_DIR = process.env.WA_MEDIA_DIR || path.resolve(__dirname, '../media');

ensureDirSync(MEDIA_DIR);

async function saveMedia(conn, message, filenameHint = 'file') {
  try {
    const m = message.message || message;
    const msgType = Object.keys(m)[0];
    const stream = await downloadContentFromMessage(m[msgType], msgType.replace(/Message$/, ''));
    const ext = mime.extension(m[msgType].mimetype || m[msgType].mimetype || 'application/octet-stream') || 'bin';
    const name = `${Date.now()}_${filenameHint}.${ext}`;
    const outPath = path.join(MEDIA_DIR, name);
    const writeStream = fs.createWriteStream(outPath);
    for await (const chunk of stream) {
      writeStream.write(chunk);
    }
    writeStream.end();
    return { path: outPath, name, mimetype: m[msgType].mimetype || null };
  } catch (err) {
    throw err;
  }
}

module.exports = { saveMedia, MEDIA_DIR };
