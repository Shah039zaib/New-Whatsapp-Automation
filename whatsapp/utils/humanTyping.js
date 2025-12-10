// whatsapp/utils/humanTyping.js
// uses baileys presence updates to simulate human typing
async function simulateTyping(conn, jid, messageText, { baseDelayMs = 300, perCharMs = 30 } = {}) {
  try {
    // send 'composing' presence
    await conn.sendPresenceUpdate('composing', jid);
    const totalDelay = baseDelayMs + (String(messageText || '').length * perCharMs);
    await new Promise(r => setTimeout(r, totalDelay));
    await conn.sendPresenceUpdate('paused', jid);
  } catch (err) {
    // ignore failures here - presence updates are best-effort
    // console.warn('simulateTyping failed', err && err.message);
  }
}

module.exports = { simulateTyping };
