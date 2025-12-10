// whatsapp/handlers/connectionHandler.js
const { DisconnectReason } = require('@adiwajshing/baileys');

async function handleConnectionUpdate(update, accountId, reconnectFn, logger) {
  try {
    const { connection, lastDisconnect } = update;
    logger.info({ accountId, connection, lastDisconnect }, 'WA connection update');

    if (connection === 'open') {
      logger.info({ accountId }, 'WhatsApp connected');
    }

    if (connection === 'close') {
      const status = lastDisconnect?.error?.output?.statusCode || null;
      // handle common disconnect reasons
      if (lastDisconnect?.error?.output?.payload?.reason === 'badSession' ||
          status === DisconnectReason.loggedOut) {
        // logged out => need to clear session and let admin rescan
        logger.warn({ accountId }, 'Session logged out, remove session & require rescan');
        // caller must handle session removal
      } else {
        // try reconnect
        logger.info({ accountId }, 'Connection closed, attempting reconnect in 2s');
        setTimeout(() => reconnectFn(accountId).catch(e => logger.error(e, 'reconnect failed')), 2000);
      }
    }
  } catch (err) {
    logger.error(err, 'connectionHandler error');
  }
}

module.exports = { handleConnectionUpdate };
