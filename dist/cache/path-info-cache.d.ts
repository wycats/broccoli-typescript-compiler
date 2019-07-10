import Cache from "../cache";
import { AbsolutePath, CanonicalPath, PathInfo } from "../interfaces";
export default class PathInfoCache extends Cache<string, CanonicalPath, PathInfo> {
    constructor(rootPath: AbsolutePath, inputPath: AbsolutePath);
}
