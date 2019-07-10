export default class Cache {
    constructor(delegate) {
        this.delegate = delegate;
        this.hits = 0;
        this.misses = 0;
        this.store = new Map();
    }
    get(key) {
        const cacheKey = this.delegate.cacheKey(key);
        let value = this.store.get(cacheKey);
        if (value === undefined) {
            this.misses++;
            value = this.delegate.create(key);
            this.store.set(cacheKey, value);
        }
        else {
            this.hits++;
        }
        return value;
    }
    clear() {
        this.store.clear();
    }
}
//# sourceMappingURL=cache.js.map