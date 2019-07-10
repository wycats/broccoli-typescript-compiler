import { CacheDelegate, CanonicalPath, PathInfo, Resolution } from "../interfaces";
export default class ResolutionCacheDelegate implements CacheDelegate<PathInfo, CanonicalPath, Resolution> {
    cacheKey(pathInfo: PathInfo): CanonicalPath;
    create(pathInfo: PathInfo): Resolution;
}
