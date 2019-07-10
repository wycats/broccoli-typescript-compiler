import { stat } from "./file-utils";
export default function resolve(pathInfo) {
    let flags = 0 /* None */;
    let stats;
    let otherStats;
    if (pathInfo.pathInInput) {
        stats = stat(pathInfo.pathInInput);
        if (stats !== undefined) {
            flags |= 4 /* Input */;
        }
    }
    if (stats === undefined) {
        stats = stat(pathInfo.path);
    }
    if (stats !== undefined) {
        flags |= stats.isDirectory() ? 2 /* Dir */ : 1 /* File */;
    }
    if ((flags & 6 /* InputDir */) === 6 /* InputDir */) {
        otherStats = stat(pathInfo.path);
        if (otherStats !== undefined && otherStats.isDirectory()) {
            flags |= 8 /* Merge */;
        }
    }
    return new ResolutionImpl(pathInfo, stats, otherStats, flags);
}
class ResolutionImpl {
    constructor(pathInfo, stats, otherStats, flags) {
        this.stats = stats;
        this.otherStats = otherStats;
        this.flags = flags;
        this.canonicalPath = pathInfo.canonicalPath;
        this.canonicalPathInInput = pathInfo.canonicalPathInInput;
        this.path = pathInfo.path;
        this.pathInInput = pathInfo.pathInInput;
        this.relativePath = pathInfo.relativePath;
    }
    isInput() {
        return this.hasFlag(4 /* Input */);
    }
    isFile() {
        return this.hasFlag(1 /* File */);
    }
    isDirectory() {
        return this.hasFlag(2 /* Dir */);
    }
    isMerged() {
        return this.hasFlag(1 /* File */);
    }
    exists() {
        return this.stats !== undefined;
    }
    hasFlag(flag) {
        return (this.flags & flag) === flag;
    }
}
//# sourceMappingURL=resolve.js.map