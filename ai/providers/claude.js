// ai/providers/claude.js
const axios = require('axios');

async function getClaudeResponse({ prompt, context = null, metadata = {} } = {}) {
  const key = process.env.CLAUDE_API_KEY;
  if (!key) throw new Error('CLAUDE_API_KEY not set in environment');

  // Use official endpoint when available. This is a template.
  // Replace url & payload structure with real Anthropic/Claude spec.
  const url = 'https://api.anthropic.com/v1/complete'; // placeholder

  const payload = {
    model: 'claude-v1',
    prompt: prompt,
    max_tokens_to_sample: Number(process.env.AI_MAX_TOKENS) || 1024,
    // optionally pass context as messages if provider expects conversational format
    context: context || undefined
  };

  // Basic retry strategy (3 attempts)
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const res = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 60_000
      });

      // Normalize response
      const text = res.data?.completion || res.data?.output || String(res.data);
      const usage = res.data?.usage || null;
      return { text, raw: res.data, usage };
    } catch (err) {
      // transient network errors -> retry
      const status = err?.response?.status;
      if (attempts >= 3 || (status && status < 500)) {
        // non-retryable or exhausted
        throw err;
      }
      // else wait small backoff
      await new Promise(r => setTimeout(r, 300 * attempts));
    }
  }
  throw new Error('Claude provider failed after retries');
}

module.exports = { getClaudeResponse };
