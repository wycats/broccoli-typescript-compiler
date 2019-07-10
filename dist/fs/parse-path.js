import { relativePathWithin, toAbsolutePath, toCanonicalPath, } from "./path-utils";
export default function parsePath(rootPath, inputPath, rawPath) {
    let path = toAbsolutePath(rawPath, rootPath);
    let pathInInput;
    let relativePath = relativePathWithin(rootPath, path);
    if (relativePath === undefined) {
        relativePath = relativePathWithin(inputPath, path);
        if (relativePath !== undefined) {
            pathInInput = path;
            path = toAbsolutePath(relativePath, rootPath);
        }
    }
    else {
        pathInInput = toAbsolutePath(relativePath, inputPath);
    }
    const canonicalPath = toCanonicalPath(path);
    const canonicalPathInInput = pathInInput && toCanonicalPath(pathInInput);
    return {
        canonicalPath,
        canonicalPathInInput,
        path,
        pathInInput,
        relativePath,
    };
}
//# sourceMappingURL=parse-path.js.map