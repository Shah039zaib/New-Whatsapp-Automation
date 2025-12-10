// whatsapp/handlers/message.handler.js
const { parseIncomingMessage } = require('../utils/parser');
const { getAIResponse, contextManager } = require('../../ai/index');
const Bottleneck = require('bottleneck');
const logger = require('../../backend/src/utils/logger');

// Rate limit per user (anti-ban)
const limiter = new Bottleneck({
  minTime: 1200, // WA recommended delay
  maxConcurrent: 1
});

// MAIN AUTO REPLY FUNCTION
async function handleIncomingMessage({ client, msg, accountId }) {
  try {
    const parsed = await parseIncomingMessage(msg);
    if (!parsed?.text) return;

    const userJid = parsed.jid;
    const text = parsed.text;

    // Step 1: Conversation ID
    let convId = contextManager.findByJid(userJid);
    if (!convId) convId = contextManager.createConversation(userJid);

    // Step 2: Store user message
    contextManager.appendMessage(convId, {
      role: 'user',
      content: text,
      timestamp: Date.now(),
      jid: userJid
    });

    // Step 3: Call AI
    const aiReply = await limiter.schedule(() =>
      getAIResponse({
        provider: null,
        prompt: text,
        conversationId: convId,
        metadata: { userJid }
      })
    );

    if (!aiReply?.text) return;

    // Step 4: Save AI reply
    contextManager.appendMessage(convId, {
      role: 'assistant',
      content: aiReply.text,
      provider: aiReply.provider,
      timestamp: Date.now()
    });

    // Step 5: Human typing simulation
    await client.sendPresenceUpdate('composing', userJid);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1800));
    await client.sendPresenceUpdate('paused', userJid);

    // Step 6: Send AI text to WhatsApp user
    await client.sendMessage(userJid, {
      text: aiReply.text
    });

    logger.info(`AI replied to ${userJid}: ${aiReply.text}`);

    return true;
  } catch (err) {
    console.error('AI Auto Reply Error:', err);
    return false;
  }
}

module.exports = { handleIncomingMessage };
