// ai/router/aiRouter.js
const Bottleneck = require('bottleneck');
const { getClaudeResponse } = require('../providers/claude');
const { getGeminiResponse } = require('../providers/gemini');
const { getGroqResponse } = require('../providers/groq');
const { getCohereResponse } = require('../providers/cohere');
const TokenCounter = require('../utils/tokenCounter');
const { aiErrorHandler } = require('../utils/aiErrorHandler');

class AiRouter {
  constructor({ providers = [], strategy = 'round_robin' } = {}) {
    this.providers = providers;
    this.strategy = strategy;
    this.index = 0; // for round-robin
    // per-provider limiter (simple spacing using Bottleneck)
    this.limiters = {};
    const defaultMs = Number(process.env.AI_RATE_LIMIT_MS) || 300;
    providers.forEach(p => {
      this.limiters[p] = new Bottleneck({ minTime: defaultMs, maxConcurrent: 1 });
    });

    // usage stats
    this.usage = providers.reduce((acc, p) => ({ ...acc, [p]: { calls: 0, tokens: 0, errors: 0 } }), {});
  }

  selectProvider() {
    if (!this.providers || this.providers.length === 0) throw new Error('No AI providers configured');
    if (this.strategy === 'round_robin') {
      const p = this.providers[this.index % this.providers.length];
      this.index++;
      return p;
    }
    // fallback to first
    return this.providers[0];
  }

  async callProvider(provider, { prompt, context = null, metadata = {} } = {}) {
    try {
      // choose function
      const fn = this._getProviderFn(provider);
      if (!fn) throw new Error(`Provider ${provider} not supported`);

      // run through limiter to avoid bursts
      const limiter = this.limiters[provider];
      const result = await limiter.schedule(() => fn({ prompt, context, metadata }));

      // token accounting if provider returns usage and token counting fallback
      const tokens = result.usage?.total_tokens || TokenCounter.estimate(prompt + (context ? JSON.stringify(context) : ''));
      this.usage[provider].calls += 1;
      this.usage[provider].tokens += tokens;

      return { text: result.text, raw: result.raw || null, usage: result.usage || { total_tokens: tokens } };
    } catch (err) {
      // track error
      if (this.usage[provider]) this.usage[provider].errors += 1;
      throw aiErrorHandler(err);
    }
  }

  _getProviderFn(provider) {
    switch (provider) {
      case 'claude': return getClaudeResponse;
      case 'gemini': return getGeminiResponse;
      case 'groq': return getGroqResponse;
      case 'cohere': return getCohereResponse;
      default: return null;
    }
  }
}

module.exports = AiRouter;
