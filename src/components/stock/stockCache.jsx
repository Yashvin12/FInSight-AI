// In-memory cache with TTL
const cache = new Map();

export const TTL = {
  STOCK_DATA: 5 * 60 * 1000,
  SENTIMENT: 30 * 60 * 1000,
  PREDICTION: 10 * 60 * 1000,
};

export function setCache(key, value, ttl) {
  cache.set(key, { value, expires: Date.now() + ttl });
}

export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { cache.delete(key); return null; }
  return entry.value;
}