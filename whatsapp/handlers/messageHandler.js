// whatsapp/handlers/messageHandler.js
// AI Auto-reply + Package Suggestion + Order Confirmation Integration (safe, non-breaking)

const axios = require('axios');
const EventEmitter = require('eventemitter3');
const { parseMessage } = require('../utils/messageParser');
const { saveMedia } = require('./mediaHandler');
const { simulateTyping } = require('../utils/humanTyping');

// AI module
const { getAIResponse, contextManager } = require('../../ai/index');

const emitter = new EventEmitter();

const lastReplyAt = new Map();
const MIN_REPLY_INTERVAL_MS = Number(process.env.WA_MIN_REPLY_INTERVAL_MS) || 1200;

async function onMessageUpsert(conn, m, accountId, logger) {
  try {
    const parsed = parseMessage(m);
    logger.info({ accountId, parsed }, "incoming-message");

    emitter.emit("message", { accountId, message: parsed, raw: m });

    // Save media if exists
    if (parsed.hasMedia) {
      try {
        const mediaInfo = await saveMedia(conn, parsed.raw, parsed.id || 'media');
        emitter.emit("mediaSaved", { accountId, message: parsed, media: mediaInfo });
      } catch (err) {
        logger.error({ err }, "media save failed");
      }
    }

    // Webhook support
    const webhook = process.env.BACKEND_WEBHOOK_URL;
    if (webhook) {
      axios.post(webhook, { accountId, message: parsed }).catch(e => {
        logger.warn({ err: e?.message }, "webhook post failed");
      });
    }

    // -------------------------
    // ⭐ ONLY INBOUND USER TEXT
    // -------------------------
    if (!parsed.text) return;
    if (parsed.fromMe) return;

    const jid = parsed.jid;

    // Cooldown
    const now = Date.now();
    const last = lastReplyAt.get(jid) || 0;
    if (now - last < MIN_REPLY_INTERVAL_MS) {
      logger.info({ jid }, "Skipping auto-reply due to cooldown");
      return;
    }
    lastReplyAt.set(jid, now);

    // -----------------------------
    // ⭐ PACKAGE SUGGESTION SUPPORT
    // -----------------------------
    let packageText = "";
    try {
      const packages = await axios
        .get(`${process.env.BACKEND_PUBLIC_URL}/api/packages/public/list`)
        .then(r => r.data.rows)
        .catch(() => []);

      if (packages.length > 0) {
        packageText = packages
          .map(p => `• ${p.title} — ${p.currency} ${p.price}\n  Features: ${(p.features || []).join(', ')}\n  Delivery: ${p.delivery_days} days\n`)
          .join("\n");
      }
    } catch (err) {
      logger.warn("Failed to fetch packages for AI");
    }

    // ---------------------------------------------------
    // ⭐ ORDER CONFIRMATION INTENT (User says YES/CONFIRM)
    // ---------------------------------------------------
    const confirmationWords = [
      "yes", "confirm", "theek", "theek hai", "ok", "order", "chalo",
      "haan", "han", "confirm karo"
    ];

    const lower = parsed.text.toLowerCase();
    const isConfirm = confirmationWords.some(w => lower.includes(w));

    if (isConfirm) {
      logger.info({ jid }, "User confirmed order — ORDER CREATION SHOULD HAPPEN HERE");

      // ⚠️ IMPORTANT:
      // We will add auto order creation here later:
      // await axios.post(`${process.env.BACKEND_INTERNAL_URL}/api/orders/from-chat`, {...})

      // DO NOT RETURN — AI should still reply
    }

    // -------------------------
    // ⭐ AI CONTEXT + REPLY FLOW
    // -------------------------
    const convId = jid;

    contextManager.appendMessage(convId, {
      role: "user",
      content: parsed.text,
      jid,
      meta: { accountId },
      timestamp: now
    });

    // Build Final AI Prompt (with packages)
    const finalPrompt = `
You are a WhatsApp Sales Assistant for Shopify Store Development Services.
Below are the available service packages:

${packageText || "No packages available right now."}

Customer message: "${parsed.text}"

Your tasks:
1. Understand customer's needs.
2. Suggest the best Shopify Service Package.
3. Give price clearly.
4. Ask if customer wants to confirm order.
5. If customer says yes, confirm, ok → theek hai → we will create their order internally.
`;

    let aiResp;
    try {
      aiResp = await getAIResponse({
        prompt: finalPrompt,
        conversationId: convId,
        metadata: { jid, accountId }
      });
    } catch (aiErr) {
      logger.error({ err: aiErr }, "AI provider error");
      return;
    }

    if (!aiResp?.text) {
      logger.warn({ jid }, "AI empty response");
      return;
    }

    // Save assistant message to memory
    contextManager.appendMessage(convId, {
      role: "assistant",
      content: aiResp.text,
      provider: aiResp.provider || null,
      usage: aiResp.usage || null,
      timestamp: Date.now()
    });

    // Simulate human typing
    try {
      await simulateTyping(conn, jid, aiResp.text, { baseDelayMs: 800, perCharMs: 20 });
    } catch (e) {
      logger.warn({ err: e?.message }, "simulateTyping failed");
    }

    // Send message
    try {
      await conn.sendMessage(jid, { text: aiResp.text });
      logger.info({ jid }, "AI auto-replied successfully");
    } catch (sendErr) {
      logger.error({ err: sendErr }, "Failed to send AI reply");
    }

  } catch (err) {
    logger.error(err, "onMessageUpsert error");
  }
}

module.exports = { onMessageUpsert, emitter };
