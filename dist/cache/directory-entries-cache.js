import Cache from "../cache";
import DirEntriesCacheDelegate from "./directory-entries-cache-delegate";
export default class DirEntriesCache extends Cache {
    constructor(resolver) {
        super(new DirEntriesCacheDelegate(resolver));
    }
}
//# sourceMappingURL=directory-entries-cache.js.map