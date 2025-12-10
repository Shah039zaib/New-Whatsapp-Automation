// ai/context/memoryStore.js
// Small helper for temporary per-user memory (non-persistent)
const MapMemory = new Map();

function setMemory(key, value) {
  MapMemory.set(key, { value, updatedAt: Date.now() });
}

function getMemory(key) {
  const e = MapMemory.get(key);
  if (!e) return null;
  return e.value;
}

function deleteMemory(key) {
  MapMemory.delete(key);
}

function flush() {
  MapMemory.clear();
}

module.exports = { setMemory, getMemory, deleteMemory, flush };
