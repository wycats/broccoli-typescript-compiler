import Cache from "../cache";
import { CanonicalPath, DirEntries, PathResolver } from "../interfaces";
export default class DirEntriesCache extends Cache<CanonicalPath, CanonicalPath, DirEntries> {
    constructor(resolver: PathResolver);
}
