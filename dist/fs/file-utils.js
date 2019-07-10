import { createHash } from "crypto";
import { readdirSync, readFileSync, statSync } from "fs";
export function readFile(path) {
    const buffer = readFileSync(path);
    const hash = createHash("sha1");
    hash.update(buffer);
    return { buffer, version: hash.digest("hex") };
}
export function readFileResolution(resolution) {
    let path;
    if (resolution.isFile()) {
        if (resolution.isInput()) {
            path = resolution.pathInInput;
        }
        else {
            path = resolution.path;
        }
    }
    if (path) {
        return readFile(path);
    }
}
export function stat(path) {
    try {
        return statSync(path);
    }
    catch (e) {
        if (e.code === "ENOENT" || e.code === "EACCES") {
            return;
        }
        throw e;
    }
}
export function readdir(path, resolver) {
    const prefix = path + "/";
    const files = [];
    const directories = [];
    for (const entry of readdirSync(path).sort()) {
        const resolution = resolver.resolve(prefix + entry);
        if (resolution.isFile()) {
            files.push(entry);
        }
        else if (resolution.isDirectory()) {
            directories.push(entry);
        }
    }
    return { files, directories };
}
//# sourceMappingURL=file-utils.js.map