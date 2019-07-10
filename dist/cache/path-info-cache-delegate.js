import parsePath from "../fs/parse-path";
import { toCanonicalPath } from "../fs/path-utils";
export default class PathInfoCacheDelegate {
    constructor(rootPath, inputPath) {
        this.rootPath = rootPath;
        this.inputPath = inputPath;
    }
    cacheKey(key) {
        return toCanonicalPath(key, this.rootPath);
    }
    create(key) {
        return parsePath(this.rootPath, this.inputPath, key);
    }
}
//# sourceMappingURL=path-info-cache-delegate.js.map