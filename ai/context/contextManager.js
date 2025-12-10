// ai/context/contextManager.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ContextManager {
  constructor({ storePath = './context_store.json', maxConversations = 2000 } = {}) {
    this.storePath = path.resolve(storePath);
    this.maxConversations = maxConversations;
    this.store = new Map();
    this._loadFromDisk();
  }

  _loadFromDisk() {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf8');
        const obj = JSON.parse(raw);
        Object.keys(obj).forEach(k => this.store.set(k, obj[k]));
      } else {
        fs.writeFileSync(this.storePath, JSON.stringify({}), 'utf8');
      }
    } catch (err) {
      console.warn('ContextManager load error, starting fresh', err.message);
    }
  }

  _persist() {
    try {
      const obj = Object.fromEntries(this.store);
      fs.writeFileSync(this.storePath, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.warn('ContextManager persist failed', err.message);
    }
  }

  createConversation(initial = []) {
    const id = uuidv4();
    this.store.set(id, initial.slice());
    this._ensureSize();
    this._persist();
    return id;
  }

  getContext(conversationId) {
    return this.store.get(conversationId) || [];
  }

  appendMessage(conversationId, message) {
    if (!this.store.has(conversationId)) this.store.set(conversationId, []);
    const arr = this.store.get(conversationId);
    arr.push(message);
    // optional: cap messages
    if (arr.length > 200) arr.shift();
    this.store.set(conversationId, arr);
    this._persist();
  }

  clearConversation(id) {
    this.store.delete(id);
    this._persist();
  }

  _ensureSize() {
    while (this.store.size > this.maxConversations) {
      // remove oldest (Map preserves insertion order)
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }
  }
}

module.exports = ContextManager;
