import { matchFiles } from "typescript";
import { useCaseSensitiveFileNames } from "../fs/path-utils";
export default function createParseConfigHost(workingPath, input) {
    function getFileSystemEntries(path) {
        return input.getFileSystemEntries(path);
    }
    function realpath(path) {
        try {
            return input.realpath(path) || path;
        }
        catch (_a) {
            return path;
        }
    }
    function readDirectory(rootDir, extensions, excludes, includes, depth) {
        return matchFiles(rootDir, extensions, excludes, includes, useCaseSensitiveFileNames, workingPath, depth, getFileSystemEntries, realpath);
    }
    function fileExists(path) {
        return input.fileExists(path);
    }
    function readFile(path) {
        return input.readFile(path);
    }
    return {
        fileExists,
        readDirectory,
        readFile,
        useCaseSensitiveFileNames,
    };
}
//# sourceMappingURL=create-parse-config-host.js.map