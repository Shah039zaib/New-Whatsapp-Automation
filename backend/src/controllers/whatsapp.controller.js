// backend/src/controllers/whatsapp.controller.js
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs-extra');
const cloudinary = require('../services/cloudinary.service');

async function status(req, res) {
  try {
    // check waManager in app locals
    const waManager = req.app.get('waManager');
    if (!waManager) return apiResponse.error(res, 'WhatsApp manager not available', 503);
    const clients = Array.from(waManager.clients ? waManager.clients.keys() : []);
    return apiResponse.ok(res, { clients });
  } catch (err) {
    return apiResponse.error(res, 'Status check failed', 500);
  }
}

async function sendText(req, res, next) {
  try {
    const { accountId, jid, text } = req.body;
    if (!jid || !text) return apiResponse.error(res, 'jid and text required', 400);
    const waManager = req.app.get('waManager');
    if (!waManager) return apiResponse.error(res, 'WhatsApp manager not available', 503);

    await waManager.sendText(accountId || process.env.WA_DEFAULT_ACCOUNT || 'main', jid, text);
    return apiResponse.ok(res, { message: 'Message queued' });
  } catch (err) {
    next(err);
  }
}

async function sendMedia(req, res, next) {
  try {
    const { accountId, jid } = req.body;
    if (!jid) return apiResponse.error(res, 'jid required', 400);
    if (!req.file) return apiResponse.error(res, 'file required', 400);

    // first upload to Cloudinary (recommended) then send via waManager
    const filePath = req.file.path;
    const uploadRes = await cloudinary.uploadFile(filePath);
    // cleanup temp file
    await fs.remove(filePath);

    const waManager = req.app.get('waManager');
    if (!waManager) return apiResponse.error(res, 'WhatsApp manager not available', 503);

    // waManager.sendMedia expects local path; we will fetch remote or re-stream
    // For simplicity, download remote to temp and send
    const tmpLocal = path.join('/tmp', `wa_media_${Date.now()}_${req.file.originalname}`);
    const axios = require('axios');
    const writer = fs.createWriteStream(tmpLocal);
    const response = await axios({ url: uploadRes.secure_url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    await new Promise((r, rej) => writer.on('finish', r).on('error', rej));

    await waManager.sendMedia(accountId || process.env.WA_DEFAULT_ACCOUNT || 'main', jid, tmpLocal, { caption: req.body.caption || '' });
    // cleanup
    await fs.remove(tmpLocal);

    return apiResponse.ok(res, { message: 'Media sent', upload: uploadRes });
  } catch (err) {
    next(err);
  }
}

module.exports = { status, sendText, sendMedia };
