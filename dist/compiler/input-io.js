import { realpathSync } from "fs";
import * as ts from "typescript";
import DirectoryEntriesCache from "../cache/directory-entries-cache";
export default class Input {
    constructor(resolver) {
        this.resolver = resolver;
        this.realpathCache = Object.create(null);
        this.entriesCache = new DirectoryEntriesCache(resolver);
    }
    fileExists(path) {
        return this.resolve(path).isFile();
    }
    directoryExists(path) {
        return this.resolve(path).isDirectory();
    }
    /**
     * Used for type resolution.
     *
     * Will merge the view of input path and root path.
     */
    getDirectories(path) {
        const resolution = this.resolve(path);
        let directories;
        if (resolution.isDirectory()) {
            if (resolution.isInput()) {
                directories = this.readdir(resolution.canonicalPathInInput).directories;
                if (resolution.isMerged()) {
                    for (const other in this.readdir(resolution.canonicalPath)
                        .directories) {
                        if (directories.indexOf(other) === -1) {
                            directories.push(other);
                        }
                    }
                }
            }
            else {
                directories = this.readdir(resolution.canonicalPath).directories;
            }
        }
        else {
            directories = [];
        }
        return directories;
    }
    /**
     * Used by config parser for matching input.
     *
     * Unlike getDirectories which merges the view of input node and root.
     * We only allow this to return entries for things within the
     * broccoli input node.
     */
    getFileSystemEntries(path) {
        const resolution = this.resolve(path);
        let entries;
        if (resolution.isDirectory() && resolution.isInput()) {
            entries = this.readdir(resolution.canonicalPathInInput);
        }
        else {
            entries = { files: [], directories: [] };
        }
        return entries;
    }
    readFile(path) {
        const resolution = this.resolve(path);
        let resolved;
        if (resolution.isFile()) {
            if (resolution.isInput()) {
                resolved = resolution.pathInInput;
            }
            else {
                resolved = resolution.path;
            }
        }
        if (resolved !== undefined) {
            return ts.sys.readFile(resolved);
        }
    }
    relativePath(path) {
        return this.resolve(path).relativePath;
    }
    realpath(path) {
        const resolution = this.resolve(path);
        if (resolution.isInput()) {
            return resolution.path;
        }
        else if (resolution.exists()) {
            const realpath = realpathSync(resolution.path, this.realpathCache);
            return this.resolve(realpath).path;
        }
    }
    reset() {
        this.entriesCache.clear();
        this.realpathCache = Object.create(null);
    }
    resolve(path) {
        return this.resolver.resolve(path);
    }
    readdir(path) {
        return this.entriesCache.get(path);
    }
}
//# sourceMappingURL=input-io.js.map