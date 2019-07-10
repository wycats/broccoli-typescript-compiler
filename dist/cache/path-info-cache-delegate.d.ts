import { AbsolutePath, CacheDelegate, CanonicalPath, PathInfo } from "../interfaces";
export default class PathInfoCacheDelegate implements CacheDelegate<string, CanonicalPath, PathInfo> {
    private rootPath;
    private inputPath;
    constructor(rootPath: AbsolutePath, inputPath: AbsolutePath);
    cacheKey(key: string): CanonicalPath;
    create(key: string): PathInfo;
}
