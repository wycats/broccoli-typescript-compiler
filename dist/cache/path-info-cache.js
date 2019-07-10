import Cache from "../cache";
import PathInfoCacheDelegate from "./path-info-cache-delegate";
export default class PathInfoCache extends Cache {
    constructor(rootPath, inputPath) {
        super(new PathInfoCacheDelegate(rootPath, inputPath));
    }
}
//# sourceMappingURL=path-info-cache.js.map