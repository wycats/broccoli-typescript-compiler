import { readdir } from "../fs/file-utils";
export default class DirEntriesCacheDelegate {
    constructor(resolver) {
        this.resolver = resolver;
    }
    cacheKey(path) {
        return path;
    }
    create(path) {
        return readdir(path, this.resolver);
    }
}
//# sourceMappingURL=directory-entries-cache-delegate.js.map