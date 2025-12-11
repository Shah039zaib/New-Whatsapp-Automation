// ai/index.js
require('dotenv').config();
const AiRouter = require('./router/aiRouter');
const ContextManager = require('./context/contextManager');
const { aiErrorHandler } = require('./utils/aiErrorHandler');
const axios = require('axios');  // ⭐ important for package fetch

const router = new AiRouter({
  providers: ['claude','gemini','groq','cohere'],
  strategy: process.env.AI_ROTATION_STRATEGY || 'round_robin'
});

const contextManager = new ContextManager({
  storePath: process.env.AI_CONTEXT_STORE_PATH || './context_store.json',
  maxConversations: 5000
});

/**
 * getAIResponse
 * input: { provider?, prompt, conversationId?, metadata? }
 * returns: { text, provider, usage, raw }
 */
async function getAIResponse({ provider, prompt, conversationId = null, metadata = {} }) {
  try {
    if (!prompt || typeof prompt !== 'string') throw new Error('Prompt required and must be a string');

    // -------------------------------
    // ⭐ FETCH SERVICE PACKAGES (SAFE)
    // -------------------------------
    let packageText = "No packages found.";
    try {
      const apiBase = process.env.BACKEND_PUBLIC_URL || "http://localhost:5000";
      const packages = await axios
        .get(`${apiBase}/api/packages/public/list`)
        .then(r => r.data.rows)
        .catch(() => []);

      if (packages && packages.length > 0) {
        packageText = packages
          .map(p =>
            `• ${p.title} — ${p.currency} ${p.price}\n  Features: ${(p.features || []).join(', ')}\n  Delivery: ${p.delivery_days} days\n`
          )
          .join("\n");
      }
    } catch (err) {
      console.log("AI Package Load Failed:", err.message);
    }

    // --------------------------------------------------------
    // ⭐ BUILD FINAL AI PROMPT (Your Shopify Sales Assistant AI)
    // --------------------------------------------------------
    const enhancedPrompt = `
You are a professional WhatsApp Sales Assistant for Shopify Store Development Services.

Below are the currently available service packages:

${packageText}

Customer message:
"${prompt}"

Your Responsibilities:
1. Identify customer's needs.
2. Recommend the best Shopify package.
3. Provide price clearly.
4. Ask if customer wants to proceed.
5. If the customer says "yes", "haan", "theek hai", "confirm", "ok", "order", we will create the order internally.
6. Stay concise, professional & friendly.
`;

    // -------------------------------
    // ⭐ PROVIDER SELECTION
    // -------------------------------
    const selected = provider || router.selectProvider();

    // load context
    const context = conversationId ? contextManager.getContext(conversationId) : null;

    // ------------------------------------------
    // ⭐ CALL ACTUAL PROVIDER WITH ENHANCED PROMPT
    // ------------------------------------------
    const resp = await router.callProvider(selected, {
      prompt: enhancedPrompt,
      context,
      metadata
    });

    // Save assistant message into context
    if (conversationId) {
      contextManager.appendMessage(conversationId, {
        role: "assistant",
        provider: selected,
        content: resp.text,
        usage: resp.usage || null,
        timestamp: Date.now()
      });
    }

    return { ...resp, provider: selected };

  } catch (err) {
    throw aiErrorHandler(err);
  }
}

module.exports = {
  getAIResponse,
  router,
  contextManager
};
