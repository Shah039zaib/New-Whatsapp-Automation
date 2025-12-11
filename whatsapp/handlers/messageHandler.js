// whatsapp/handlers/messageHandler.js
const axios = require('axios');
const EventEmitter = require('eventemitter3');
const { parseMessage } = require('../utils/messageParser');
const { saveMedia } = require('./mediaHandler');
const { simulateTyping } = require('../utils/humanTyping');
const { getAIResponse, contextManager } = require('../../ai/index');

const emitter = new EventEmitter();
const lastReplyAt = new Map();
const MIN_REPLY_INTERVAL_MS = Number(process.env.WA_MIN_REPLY_INTERVAL_MS) || 1200;

async function onMessageUpsert(conn, m, accountId, logger) {
  try {
    const parsed = parseMessage(m);
    logger.info({ accountId, parsed }, "incoming-message");

    emitter.emit("message", { accountId, message: parsed, raw: m });

    if (parsed.hasMedia) {
      try {
        const mediaInfo = await saveMedia(conn, parsed.raw, parsed.id || 'media');
        emitter.emit("mediaSaved", { accountId, message: parsed, media: mediaInfo });
      } catch (err) {
        logger.error({ err }, "media save failed");
      }
    }

    const webhook = process.env.BACKEND_WEBHOOK_URL;
    if (webhook) {
      axios.post(webhook, { accountId, message: parsed }).catch(e => {
        logger.warn({ err: e?.message }, "webhook post failed");
      });
    }

    // only inbound text
    if (!parsed.text) return;
    if (parsed.fromMe) return;

    const jid = parsed.jid;
    const now = Date.now();
    const last = lastReplyAt.get(jid) || 0;
    if (now - last < MIN_REPLY_INTERVAL_MS) {
      logger.info({ jid }, "Skipping auto-reply due to cooldown");
      return;
    }
    lastReplyAt.set(jid, now);

    // fetch packages text (for AI prompt)
    let packageText = "";
    try {
      const apiBase = process.env.BACKEND_PUBLIC_URL || "http://localhost:5000";
      const packages = await axios.get(`${apiBase}/api/packages/public/list`).then(r => r.data.rows).catch(()=>[]);
      if (packages && packages.length) {
        packageText = packages.map(p => `• ${p.title} — ${p.currency} ${p.price}\n  Features: ${(p.features||[]).join(', ')}\n  Delivery: ${p.delivery_days} days\n`).join("\n");
      }
    } catch (err) {
      logger.warn("Failed to fetch packages for AI");
    }

    // confirmation detection
    const confirmationWords = ["yes","confirm","theek","theek hai","ok","order","chalo","haan","han","confirm karo"];
    const lower = parsed.text.toLowerCase();
    const isConfirm = confirmationWords.some(w => lower.includes(w));

    // conversation id
    const convId = jid;
    // append user to context
    contextManager.appendMessage(convId, {
      role: "user",
      content: parsed.text,
      jid,
      meta: { accountId },
      timestamp: now
    });

    // build AI prompt (includes packages)
    const finalPrompt = `
You are a professional WhatsApp Sales Assistant for Shopify Store Development Services.

Available packages:
${packageText || "No packages configured."}

Customer message: "${parsed.text}"

Tasks:
1) Understand user's need.
2) Recommend best package (Basic/Standard/Premium).
3) If user confirms purchase (yes, theek hai, confirm, ok), output ONLY a single line with format:
  ORDER_INTENT::<PACKAGE_SLUG_OR_TITLE_IN_PLAIN_TEXT>
If user is not confirming, respond normally as sales assistant.
Be concise and friendly.
`;

    // call AI
    let aiResp;
    try {
      aiResp = await getAIResponse({ prompt: finalPrompt, conversationId: convId, metadata: { jid, accountId } });
    } catch (e) {
      logger.error({ err: e }, "AI provider error");
      return;
    }

    if (!aiResp || !aiResp.text) {
      logger.warn({ jid }, "AI returned empty response");
      return;
    }

    // Save assistant to context
    contextManager.appendMessage(convId, {
      role: "assistant",
      content: aiResp.text,
      provider: aiResp.provider || null,
      usage: aiResp.usage || null,
      timestamp: Date.now()
    });

    // Check AI for explicit ORDER_INTENT token
    const aiText = aiResp.text.trim();
    const orderIntentMatch = aiText.match(/ORDER_INTENT::(.+)/i);
    let detectedPackage = null;
    if (orderIntentMatch) {
      detectedPackage = orderIntentMatch[1].trim();
      logger.info({ jid, detectedPackage }, "AI detected ORDER_INTENT");
    } else if (isConfirm) {
      // If AI didn't return structured token but user typed confirm, attempt to extract package by asking AI small extractor
      try {
        const extractorPrompt = `User message: "${parsed.text}"\nBased on conversation context, which package did the user confirm? Reply with package title or "NO_PACKAGE".`;
        const ext = await getAIResponse({ prompt: extractorPrompt, conversationId: convId, metadata: { jid, accountId } });
        const extText = (ext && ext.text) ? ext.text.trim() : "";
        if (extText && /NO_PACKAGE/i.test(extText) === false) {
          detectedPackage = extText;
          logger.info({ jid, detectedPackage }, "Extractor found package on confirmation");
        }
      } catch (e) {
        logger.warn({ err: e?.message }, "Package extractor failed");
      }
    }

    // If we detected package, call internal order API (safe, idempotent)
    if (detectedPackage) {
      try {
        // call backend internal endpoint (requires INTERNAL_SECRET header)
        const internalBase = process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_PUBLIC_URL || "http://localhost:5000";
        const resp = await axios.post(
          `${internalBase}/api/orders/from-chat-internal`,
          {
            jid,
            items: [{ title: detectedPackage, quantity: 1 }],
            metadata: { source: "wa_auto", detectedByAI: true, aiSnippet: aiText }
          },
          { headers: { 'x-internal-secret': process.env.INTERNAL_SECRET } , timeout: 15000 }
        ).catch(e => ({ error: e }));
        if (resp && !resp.error && resp.data && resp.data.ok) {
          const orderId = resp.data.order?.id || resp.data.orderId || 'N/A';
          // send confirmation to user BEFORE normal AI reply (or after) — we append a short confirmation
          try {
            await conn.sendMessage(jid, { text: `Aapka order create ho gaya. Order ID: ${orderId}. Hum jaldi payment details bhej rahay hain.` });
          } catch (e) {
            logger.warn({ err: e?.message }, "failed to send order confirmation");
          }
        } else {
          logger.warn({ jid, resp }, "internal order create failed");
        }
      } catch (err) {
        logger.error({ err }, "auto-order call failed");
      }
    }

    // Typing simulation & send AI reply (original reply)
    try {
      await simulateTyping(conn, jid, aiResp.text, { baseDelayMs: 800, perCharMs: 18 });
    } catch (e) {
      logger.warn({ err: e?.message }, "simulateTyping failed");
    }

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
