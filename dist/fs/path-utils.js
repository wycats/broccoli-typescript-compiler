import * as ts from "typescript";
export const useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
export const getCanonicalFileName = ts.sys.useCaseSensitiveFileNames
    ? (fileName) => fileName
    : (fileName) => fileName.toLowerCase();
export const defaultLibLocation = ts.getDirectoryPath(toCanonicalPath(ts.sys.getExecutingFilePath()));
export function normalizePath(path) {
    if (path.length === 0) {
        return path;
    }
    return trimTrailingSlash(ts.normalizePath(path));
}
export function isWithin(rootPath, path) {
    return (path.length > rootPath.length &&
        path.lastIndexOf(rootPath, 0) === 0 &&
        path.charCodeAt(rootPath.length) === 47 /* Slash */);
}
export function relativePathWithin(root, path) {
    let relativePath;
    if (path.length > root.length &&
        path.lastIndexOf(root, 0) === 0 &&
        path.charCodeAt(root.length) === 47 /* Slash */) {
        relativePath = path.substring(root.length + 1);
    }
    else if (path === root) {
        relativePath = "";
    }
    return relativePath;
}
export function toCanonicalPath(fileName, basePath) {
    const p = ts.toPath(fileName, basePath === undefined ? currentDirectory() : basePath, getCanonicalFileName);
    return trimTrailingSlash(p);
}
export function toAbsolutePath(fileName, basePath) {
    const p = ts.toPath(fileName, basePath === undefined ? currentDirectory() : basePath, name => name);
    return trimTrailingSlash(p);
}
export { getDirectoryPath } from "typescript";
function trimTrailingSlash(path) {
    if (path.charCodeAt(path.length - 1) === 47 /* Slash */) {
        return path.slice(0, path.length - 1);
    }
    return path;
}
function currentDirectory() {
    return normalizePath(process.cwd());
}
//# sourceMappingURL=path-utils.js.map