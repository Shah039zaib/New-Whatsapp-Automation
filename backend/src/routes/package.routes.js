// backend/src/routes/package.routes.js
const express = require('express');
const router = express.Router();
const { createPackage, updatePackage, getPackage, listPackages } = require('../controllers/package.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Admin: create / update / list
router.post('/', authMiddleware, createPackage);
router.put('/:id', authMiddleware, updatePackage);
router.get('/', authMiddleware, listPackages);
router.get('/:id', authMiddleware, getPackage);

// Public listing (optional): allow unauthenticated to list active packages
router.get('/public/list', (req, res, next) => {
  // forward to controller but force onlyActive=true
  req.query.onlyActive = 'true';
  return listPackages(req, res, next);
});

module.exports = router;
