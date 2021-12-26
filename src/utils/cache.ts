class Cache<K, V> {
  private pool: Map<K, V> = new Map();
  constructor() {}

  async cacheOrLoad(id: K, loader: (id: K) => Promise<V>) {
    if (this.pool.has(id)) {
      const kagIr = this.pool.get(id);
      if (!kagIr) {
        throw new Error("Cache: something went wrong");
      }
      return kagIr;
    } else {
      const value = await loader(id);
      this.store(id, value);
      return value;
    }
  }

  store(id: K, value: V) {
    this.pool.set(id, value);
  }
}

export default Cache;
