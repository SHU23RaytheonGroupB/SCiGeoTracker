const NodeCache = require("node-cache");

let _instance; // Moved outside the class to simulate private static field

class CacheLocal {
  constructor(ttlSeconds) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  static getInstance() {
    if (!_instance) {
      _instance = new CacheLocal(100000);
    }
    return _instance;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    return this.cache.set(key, value);
  }

  getTtl(key) {
    return this.cache.getTtl(key);
  }
  ttl(key, ttl) {
    return this.cache.ttl(key, ttl);
  }
  has(key) {
    return this.cache.has(key);
  }
}

module.exports = CacheLocal;
