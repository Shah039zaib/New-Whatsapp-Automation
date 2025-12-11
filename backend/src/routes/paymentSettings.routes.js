// backend/src/routes/paymentSettings.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/paymentSettings.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, ctrl.get);
router.put('/', authMiddleware, ctrl.update);

module.exports = router;
