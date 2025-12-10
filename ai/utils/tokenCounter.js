// ai/utils/tokenCounter.js
// Simple heuristic: 1 token ~ 0.75 words (rough). Used as fallback if provider doesn't return usage.
function estimate(text) {
  if (!text) return 0;
  const words = String(text).trim().split(/\s+/).length;
  const tokens = Math.ceil(words / 0.75);
  return tokens;
}

module.exports = estimate;
