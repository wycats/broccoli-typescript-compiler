import { CacheDelegate, CanonicalPath, DirEntries, PathResolver } from "../interfaces";
export default class DirEntriesCacheDelegate implements CacheDelegate<CanonicalPath, CanonicalPath, DirEntries> {
    private resolver;
    constructor(resolver: PathResolver);
    cacheKey(path: CanonicalPath): CanonicalPath;
    create(path: CanonicalPath): DirEntries;
}
