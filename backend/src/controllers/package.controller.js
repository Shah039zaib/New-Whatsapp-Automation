// backend/src/controllers/package.controller.js
const apiResponse = require('../utils/apiResponse');
const pkgService = require('../services/package.service');

async function createPackage(req, res, next) {
  try {
    const body = req.body;
    if (!body.title) return apiResponse.error(res, 'title required', 400);
    const p = await pkgService.addPackage(body);
    return apiResponse.ok(res, { package: p });
  } catch (err) { next(err); }
}

async function updatePackage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const body = req.body;
    const p = await pkgService.editPackage(id, body);
    return apiResponse.ok(res, { package: p });
  } catch (err) { next(err); }
}

async function getPackage(req, res, next) {
  try {
    const id = req.params.id;
    const p = await pkgService.getPackage(id);
    if (!p) return apiResponse.error(res, 'Package not found', 404);
    return apiResponse.ok(res, { package: p });
  } catch (err) { next(err); }
}

async function listPackages(req, res, next) {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const onlyActive = req.query.onlyActive === 'false' ? false : true;
    const rows = await pkgService.listAll(limit, offset, onlyActive);
    return apiResponse.ok(res, { rows });
  } catch (err) { next(err); }
}

module.exports = { createPackage, updatePackage, getPackage, listPackages };
