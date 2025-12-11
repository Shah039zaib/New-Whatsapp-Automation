// backend/src/services/package.service.js
const pkgModel = require('../models/package.model');

async function addPackage(payload) {
  // slug generation simple: title -> slug
  const slug = (payload.slug || payload.title || '').toString().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const p = await pkgModel.createPackage({ ...payload, slug });
  return p;
}

async function editPackage(id, payload) {
  // ensure features serialized if present
  if (payload.features && !Array.isArray(payload.features)) {
    payload.features = JSON.parse(payload.features);
  }
  return pkgModel.updatePackage(id, payload);
}

async function getPackage(idOrSlug) {
  if (!idOrSlug) return null;
  if (Number(idOrSlug)) {
    return pkgModel.findPackageById(Number(idOrSlug));
  } else {
    return pkgModel.findPackageBySlug(idOrSlug);
  }
}

async function listAll(limit = 50, offset = 0, onlyActive = true) {
  return pkgModel.listPackages(limit, offset, onlyActive);
}

module.exports = { addPackage, editPackage, getPackage, listAll };
