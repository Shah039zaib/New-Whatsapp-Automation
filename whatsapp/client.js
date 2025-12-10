// whatsapp/client.js
require('dotenv').config();
const pino = require('pino');
const logger = pino({ level: 'info' });

// NOTE: install baileys and implement actual connection
// const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');

async function startWhatsappClient() {
  logger.info('WhatsApp client skeleton started');
  // TODO: integrate baileys, session store, QR server
}

if (require.main === module) {
  startWhatsappClient().catch(err => {
    logger.error('WA client error', err);
    process.exit(1);
  });
}

module.exports = { startWhatsappClient };
