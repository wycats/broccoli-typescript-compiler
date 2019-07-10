import { CacheDelegate } from "./interfaces";
export default class Cache<K, CK, V> {
    private delegate;
    hits: number;
    misses: number;
    private store;
    constructor(delegate: CacheDelegate<K, CK, V>);
    get(key: K): V;
    clear(): void;
}
