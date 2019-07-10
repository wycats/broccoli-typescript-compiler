import { AbsolutePath, DirEntries, PathResolver } from "../interfaces";
export default class Input {
    private resolver;
    private entriesCache;
    private realpathCache;
    constructor(resolver: PathResolver);
    fileExists(path: string): boolean;
    directoryExists(path: string): boolean;
    /**
     * Used for type resolution.
     *
     * Will merge the view of input path and root path.
     */
    getDirectories(path: string): string[];
    /**
     * Used by config parser for matching input.
     *
     * Unlike getDirectories which merges the view of input node and root.
     * We only allow this to return entries for things within the
     * broccoli input node.
     */
    getFileSystemEntries(path: string): DirEntries;
    readFile(path: string): string | undefined;
    relativePath(path: string): string | undefined;
    realpath(path: string): AbsolutePath | undefined;
    reset(): void;
    private resolve;
    private readdir;
}
