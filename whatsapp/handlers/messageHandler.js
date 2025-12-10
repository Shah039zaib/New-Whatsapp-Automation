// whatsapp/handlers/messageHandler.js
// AI Auto-reply integrated (safe, minimal, non-breaking).
const axios = require('axios');
const EventEmitter = require('eventemitter3');
const { parseMessage } = require('../utils/messageParser');
const { saveMedia } = require('./mediaHandler');
const { simulateTyping } = require('../utils/humanTyping');

// AI module (root ai/index.js) — ensure path correct: whatsapp/handlers -> ../../ai/index
const { getAIResponse, contextManager } = require('../../ai/index');

const emitter = new EventEmitter(); // events: 'message' (payload), 'mediaSaved'

// Simple in-memory cooldown map to avoid replying too fast to same jid
const lastReplyAt = new Map();
const MIN_REPLY_INTERVAL_MS = Number(process.env.WA_MIN_REPLY_INTERVAL_MS) || 1200; // adjust via env

async function onMessageUpsert(conn, m, accountId, logger) {
  try {
    const parsed = parseMessage(m);
    logger.info({ accountId, parsed }, 'incoming-message');

    // Emit local event so backend service can subscribe
    emitter.emit('message', { accountId, message: parsed, raw: m });

    // If media, save and emit
    if (parsed.hasMedia) {
      try {
        const mediaInfo = await saveMedia(conn, parsed.raw, parsed.id || 'media');
        emitter.emit('mediaSaved', { accountId, message: parsed, media: mediaInfo });
      } catch (err) {
        logger.error({ err }, 'media save failed');
      }
    }

    // Optionally POST to backend webhook (non-blocking)
    const webhook = process.env.BACKEND_WEBHOOK_URL;
    if (webhook) {
      axios.post(webhook, { accountId, message: parsed }).catch(e => {
        logger.warn({ err: e && e.message }, 'webhook post failed');
      });
    }

    // -----------------------------
    // ⭐ AI AUTO-REPLY INTEGRATION
    // -----------------------------
    // Only reply to inbound user messages (ignore messages from us)
    if (!parsed.text) return;
    if (parsed.fromMe) return;

    const jid = parsed.jid;
    const now = Date.now();
    const last = lastReplyAt.get(jid) || 0;
    if (now - last < MIN_REPLY_INTERVAL_MS) {
      logger.info({ jid }, 'Skipping auto-reply due to cooldown');
      return;
    }
    // update last reply time early to prevent races
    lastReplyAt.set(jid, now);

    // Use jid as conversationId (simple and deterministic)
    const convId = jid;

    // Save user message into context (contextManager will create entry if missing)
    contextManager.appendMessage(convId, {
      role: 'user',
      content: parsed.text,
      jid,
      meta: { accountId },
      timestamp: now
    });

    // Call AI (router handles provider selection + rate-limits internally)
    let aiResp;
    try {
      aiResp = await getAIResponse({
        prompt: parsed.text,
        conversationId: convId,
        metadata: { jid, accountId }
      });
    } catch (aiErr) {
      logger.error({ err: aiErr }, 'AI provider error, skipping reply');
      return;
    }

    if (!aiResp || !aiResp.text) {
      logger.warn({ jid }, 'AI returned empty response, skipping send');
      return;
    }

    // Save assistant message to context
    contextManager.appendMessage(convId, {
      role: 'assistant',
      content: aiResp.text,
      provider: aiResp.provider || null,
      usage: aiResp.usage || null,
      timestamp: Date.now()
    });

    // Simulate human typing (best-effort). use provided util.
    try {
      await simulateTyping(conn, jid, aiResp.text, { baseDelayMs: 800, perCharMs: 20 });
    } catch (e) {
      // typing simulation is best-effort, continue to send even on failure
      logger.warn({ err: e && e.message }, 'simulateTyping failed (proceeding to send)');
    }

    // Send AI reply (rate-limited on send side is handled by manager.rateLimiter if used)
    try {
      await conn.sendMessage(jid, { text: aiResp.text });
      logger.info({ jid, provider: aiResp.provider }, 'AI auto-replied successfully');
    } catch (sendErr) {
      logger.error({ err: sendErr }, 'Failed to send AI reply');
    }

  } catch (err) {
    logger.error(err, 'onMessageUpsert error');
  }
}

module.exports = { onMessageUpsert, emitter };
