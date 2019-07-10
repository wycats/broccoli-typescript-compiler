import PathInfoCache from "../cache/path-info-cache";
import ResolutionCache from "../cache/resolution-cache";
export default class PathResolverImpl {
    constructor(rootPath, inputPath) {
        this.resolutionCache = new ResolutionCache();
        this.pathInfoCache = new PathInfoCache(rootPath, inputPath);
    }
    resolve(path) {
        const pathInfo = this.pathInfoCache.get(path);
        return this.resolutionCache.get(pathInfo);
    }
    reset() {
        // PathInfo cache is not build specific
        // resolutions are
        this.resolutionCache.clear();
    }
}
//# sourceMappingURL=path-resolver.js.map