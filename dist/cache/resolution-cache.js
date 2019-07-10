import Cache from "../cache";
import ResolutionCacheDelegate from "./resolution-cache-delegate";
export default class ResolutionCache extends Cache {
    constructor() {
        super(new ResolutionCacheDelegate());
    }
}
//# sourceMappingURL=resolution-cache.js.map