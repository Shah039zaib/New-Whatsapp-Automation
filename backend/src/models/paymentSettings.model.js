// backend/src/models/paymentSettings.model.js
const pool = require('../config/db').getPool();

module.exports = {
  async getSettings() {
    const res = await pool.query(`SELECT * FROM payment_settings LIMIT 1`);
    return res.rows[0] || null;
  },

  async updateSettings(data) {
    const { easypaisa_name, easypaisa_number, jazzcash_name, jazzcash_number, bank_title, bank_account, bank_iban } = data;

    const res = await pool.query(`
      UPDATE payment_settings SET
        easypaisa_name=$1,
        easypaisa_number=$2,
        jazzcash_name=$3,
        jazzcash_number=$4,
        bank_title=$5,
        bank_account=$6,
        bank_iban=$7
      RETURNING *;
    `, [
      easypaisa_name || '',
      easypaisa_number || '',
      jazzcash_name || '',
      jazzcash_number || '',
      bank_title || '',
      bank_account || '',
      bank_iban || ''
    ]);

    return res.rows[0];
  }
};
