// backend/src/controllers/ai.controller.js
const apiResponse = require('../utils/apiResponse');

// integrate ai module (our ai package)
const { getAIResponse, contextManager } = require('../../ai/index');

async function askAI(req, res, next) {
  try {
    const { prompt, conversationId, provider } = req.body;
    if (!prompt) return apiResponse.error(res, 'Prompt required', 400);

    // create conversation if needed
    const convId = conversationId || contextManager.createConversation();
    // append user
    contextManager.appendMessage(convId, { role: 'user', content: prompt, timestamp: Date.now(), userId: req.user?.id || null });

    const resp = await getAIResponse({ provider, prompt, conversationId: convId, metadata: { userId: req.user?.id || null } });

    // append assistant message
    contextManager.appendMessage(convId, { role: 'assistant', content: resp.text, provider: resp.provider, usage: resp.usage, timestamp: Date.now() });

    return apiResponse.ok(res, { conversationId: convId, response: resp });
  } catch (err) {
    next(err);
  }
}

module.exports = { askAI };
