// ai/index.js
require('dotenv').config();
const AiRouter = require('./router/aiRouter');
const ContextManager = require('./context/contextManager');
const { aiErrorHandler } = require('./utils/aiErrorHandler');

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
    // ensure prompt is string
    if (!prompt || typeof prompt !== 'string') throw new Error('Prompt required and must be a string');

    // select provider (explicit or routed)
    const selected = provider || router.selectProvider();

    // load context for conversation
    const context = conversationId ? contextManager.getContext(conversationId) : null;

    // call through router (handles provider call, retries, rate-limits)
    const resp = await router.callProvider(selected, { prompt, context, metadata });

    // store to context manager if conversationId present
    if (conversationId) {
      contextManager.appendMessage(conversationId, {
        role: 'assistant',
        provider: selected,
        content: resp.text,
        usage: resp.usage || null,
        timestamp: Date.now()
      });
    }

    return { ...resp, provider: selected };
  } catch (err) {
    // convert errors to consistent format
    throw aiErrorHandler(err);
  }
}

module.exports = {
  getAIResponse,
  router,
  contextManager
};
