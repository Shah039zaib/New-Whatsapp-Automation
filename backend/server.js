// backend/server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// attach socket.io
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

// Start WhatsApp manager if whatsapp package available
(async () => {
  try {
    // require lazily to avoid errors when running tests without whatsapp package
    const { WhatsAppManager } = require('../whatsapp/client');
    const waManager = new WhatsAppManager({ httpServer: server });
    // start default account if env says so
    const defaultAccount = process.env.WA_DEFAULT_ACCOUNT || 'main';
    await waManager.startClient(defaultAccount, { displayName: 'ShopifyWA' });
    // forward WA events to socket.io and to app locals
    const waEvents = waManager.events();
    waEvents.on('message', payload => {
      io.emit('wa:message', payload);
    });
    waEvents.on('mediaSaved', payload => {
      io.emit('wa:media', payload);
    });

    // make waManager accessible via app
    app.set('waManager', waManager);
    logger.info('WhatsApp Manager started');
  } catch (err) {
    logger.warn('WhatsApp Manager not started: ' + (err && err.message));
  }
})();

// Start server
server.listen(PORT, () => {
  logger.info(`Backend listening on ${PORT}`);
});
