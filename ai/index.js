// ai/index.js
require('dotenv').config();
const { getClaudeResponse } = require('./providers/claude');
const { getGeminiResponse } = require('./providers/gemini');

async function getAIResponse({ provider, prompt, context }) {
  // simple router: provider string = 'claude' | 'gemini'
  if (provider === 'claude') return getClaudeResponse({ prompt, context });
  if (provider === 'gemini') return getGeminiResponse({ prompt, context });

  // fallback: try claude then gemini
  let resp = await getClaudeResponse({ prompt, context }).catch(() => null);
  if (resp) return resp;
  return getGeminiResponse({ prompt, context });
}

module.exports = { getAIResponse };
