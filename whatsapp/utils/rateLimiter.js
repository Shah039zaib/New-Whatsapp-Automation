// whatsapp/utils/rateLimiter.js
const Bottleneck = require('bottleneck');

class RateLimiter {
  constructor({ minTime = Number(process.env.WA_RATE_LIMIT_MS) || 500 } = {}) {
    this.minTime = minTime;
    this.limiters = new Map(); // accountId -> limiter
  }

  getLimiter(accountId) {
    if (!this.limiters.has(accountId)) {
      const limiter = new Bottleneck({ minTime: this.minTime, maxConcurrent: 1 });
      this.limiters.set(accountId, limiter);
    }
    return this.limiters.get(accountId);
  }

  async schedule(accountId, fn) {
    const limiter = this.getLimiter(accountId);
    return limiter.schedule(() => fn());
  }
}

module.exports = RateLimiter;
