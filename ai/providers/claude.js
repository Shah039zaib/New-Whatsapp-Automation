// ai/providers/claude.js
const axios = require('axios');

async function getClaudeResponse({ prompt, context = [] }) {
  const key = process.env.CLAUDE_API_KEY;
  if (!key) throw new Error('CLAUDE_API_KEY not set');

  // NOTE: real endpoint & payload differs per provider.
  // This is a template: integrate official SDK / endpoint later.
  const res = await axios.post('https://api.anthropic.example/v1/complete', {
    prompt,
    context
  }, {
    headers: { Authorization: `Bearer ${key}` }
  });

  return { text: res.data?.output || String(res.data) };
}

module.exports = { getClaudeResponse };
