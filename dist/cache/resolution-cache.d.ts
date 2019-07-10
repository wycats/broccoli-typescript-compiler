import Cache from "../cache";
import { CanonicalPath, PathInfo, Resolution } from "../interfaces";
export default class ResolutionCache extends Cache<PathInfo, CanonicalPath, Resolution> {
    constructor();
}
