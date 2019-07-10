import resolve from "../fs/resolve";
export default class ResolutionCacheDelegate {
    cacheKey(pathInfo) {
        return pathInfo.canonicalPath;
    }
    create(pathInfo) {
        return resolve(pathInfo);
    }
}
//# sourceMappingURL=resolution-cache-delegate.js.map