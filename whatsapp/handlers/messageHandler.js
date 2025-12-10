// whatsapp/handlers/messageHandler.js
async function handleIncomingMessage(client, message) {
  // message parsing template
  console.log('Incoming message', message?.key?.remoteJid);
  // pass to backend via API/socket or process locally
}

module.exports = { handleIncomingMessage };
