// ai/utils/formatter.js
function normalizeText(input) {
  if (!input && input !== '') return '';
  return String(input).trim().replace(/\s+/g, ' ');
}

function buildSystemPrompt({ businessName = 'ShopifyWA', locale = 'en' } = {}) {
  return `System: You are ${businessName} AI assistant. Locale: ${locale}. Be concise, helpful and follow payment & privacy rules.`;
}

module.exports = { normalizeText, buildSystemPrompt };
