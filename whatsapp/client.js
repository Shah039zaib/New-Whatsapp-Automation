// whatsapp/client.js
require('dotenv').config();
const path = require('path');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheStore, DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys');
const { attachQrSocket, emitQrEvent } = require('./qr/qrServer');
const SessionStore = require('./sessions/sessionStore');
const { onMessageUpsert, emitter } = require('./handlers/messageHandler');
const { handleConnectionUpdate } = require('./handlers/connectionHandler');
const RateLimiter = require('./utils/rateLimiter');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

class WhatsAppManager {
  constructor({ httpServer = null } = {}) {
    this.sessionStore = new SessionStore();
    this.rateLimiter = new RateLimiter();
    this.clients = new Map(); // accountId -> { conn, state }
    this.httpServer = httpServer;
    if (httpServer) {
      this.io = attachQrSocket(httpServer);
    }
  }

  // Create / start a client for an accountId
  async startClient(accountId, { displayName = process.env.WA_DEFAULT_SENDER_NAME || 'ShopifyWA' } = {}) {
    if (this.clients.has(accountId)) {
      logger.info({ accountId }, 'client already started');
      return this.clients.get(accountId);
    }

    // Ensure auth folder exists for account
    const authPath = this.sessionStore.getAuthPath(accountId);
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    // fetch version
    let version = [2, 2204, 13];
    try {
      const v = await fetchLatestBaileysVersion();
      version = v.version;
    } catch (err) {
      logger.warn('Failed to fetch latest baileys version; using default');
    }

    const conn = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ['ShopifyWA','Safari','1.0'],
      generateHighQualityLinkPreview: true
    });

    // store
    this.clients.set(accountId, { conn, accountId });
    // bind events
    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
      handleConnectionUpdate(update, accountId, this._reconnectClient.bind(this), logger);
      // if QR present -> emit to socket
      if (update.qr) {
        emitQrEvent(accountId, { qr: update.qr, timestamp: Date.now() });
      }
      // store state if connected
      if (update.connection === 'open') {
        // set display name if possible (profile name)
        (async () => {
          try {
            await conn.updateProfileName(displayName);
          } catch (e) {
            logger.warn({ err: e && e.message }, 'updateProfileName failed');
          }
        })();
      }
    });

    // message upsert
    conn.ev.on('messages.upsert', (m) => {
      // process in background (non-blocking)
      onMessageUpsert(conn, m, accountId, logger).catch(e => logger.error(e, 'message handler failed'));
    });

    // keep client reference
    // return object
    return { conn, accountId, authPath };
  }

  // stop client
  async stopClient(accountId) {
    const entry = this.clients.get(accountId);
    if (!entry) return;
    try {
      await entry.conn.logout();
    } catch (err) {
      logger.warn(err, 'logout failed');
    }
    this.clients.delete(accountId);
  }

  // reconnect logic triggered by handler
  async _reconnectClient(accountId) {
    try {
      await this.stopClient(accountId);
      // small delay
      await new Promise(r => setTimeout(r, 1500));
      await this.startClient(accountId);
    } catch (err) {
      logger.error(err, 'reconnectClient failed');
    }
  }

  // send text message (rate-limited)
  async sendText(accountId, jid, text, { quoted = null } = {}) {
    const entry = this.clients.get(accountId);
    if (!entry) throw new Error('Account not connected');
    const fn = async () => {
      return entry.conn.sendMessage(jid, { text }, { quoted });
    };
    return this.rateLimiter.schedule(accountId, fn);
  }

  // send media (path or stream)
  async sendMedia(accountId, jid, filePath, { caption = '', mimetype = null } = {}) {
    const entry = this.clients.get(accountId);
    if (!entry) throw new Error('Account not connected');
    const fn = async () => {
      const fs = require('fs');
      const stream = fs.createReadStream(filePath);
      return entry.conn.sendMessage(jid, { [mimetype && mimetype.startsWith('image') ? 'image' : 'document']: { stream, mimetype }, caption });
    };
    return this.rateLimiter.schedule(accountId, fn);
  }

  // expose event emitter to backend
  events() {
    return emitter;
  }
}

module.exports = { WhatsAppManager };
