// whatsapp/sessions/sessionStore.js
// Session/account registry: store known accounts and metadata.
// Uses fs-extra for promise-based fs operations.

const fs = require('fs-extra');
const path = require('path');

class SessionStore {
  constructor({ basePath = process.env.WA_SESSION_DIR || path.resolve(__dirname, '../sessions_data') } = {}) {
    this.basePath = path.resolve(basePath);
    this.registryFile = path.join(this.basePath, 'registry.json');
    fs.ensureDirSync(this.basePath);
    if (!fs.existsSync(this.registryFile)) fs.writeJsonSync(this.registryFile, {});
  }

  _readRegistry() {
    try {
      return fs.readJsonSync(this.registryFile);
    } catch (err) {
      return {};
    }
  }

  _writeRegistry(obj) {
    fs.writeJsonSync(this.registryFile, obj, { spaces: 2 });
  }

  // add account metadata
  addAccount(accountId, meta = {}) {
    const reg = this._readRegistry();
    reg[accountId] = { ...(reg[accountId] || {}), ...meta, createdAt: reg[accountId]?.createdAt || Date.now() };
    this._writeRegistry(reg);
    return reg[accountId];
  }

  // remove account completely
  removeAccount(accountId) {
    const reg = this._readRegistry();
    delete reg[accountId];
    this._writeRegistry(reg);
    // do NOT delete session files here automatically; caller should handle
  }

  listAccounts() {
    return this._readRegistry();
  }

  getAccount(accountId) {
    const reg = this._readRegistry();
    return reg[accountId] || null;
  }

  // return path to auth folder for account (used by baileys useMultiFileAuthState)
  getAuthPath(accountId) {
    return path.join(this.basePath, accountId);
  }
}

module.exports = SessionStore;
