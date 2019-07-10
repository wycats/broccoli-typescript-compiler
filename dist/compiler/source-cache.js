import * as ts from "typescript";
import { readFileResolution } from "../fs/file-utils";
const SharedRegistry = ts.createDocumentRegistry();
export default class SourceCache {
    constructor(resolver, options) {
        this.resolver = resolver;
        this.options = options;
        this.sourceFiles = new Map();
        this.bucketKey = SharedRegistry.getKeyForCompilationSettings(options);
    }
    updateOptions(options) {
        const bucketKey = SharedRegistry.getKeyForCompilationSettings(options);
        this.options = options;
        if (this.bucketKey !== bucketKey) {
            this.releaseAll();
            this.bucketKey = bucketKey;
        }
    }
    getSourceFile(fileName) {
        const resolution = this.resolve(fileName);
        return this.getSourceFileByPath(fileName, resolution.canonicalPath);
    }
    getSourceFileByPath(fileName, path) {
        const resolution = this.resolve(path);
        return this.getSourceFileByResolution(resolution, fileName, path);
    }
    releaseUnusedSourceFiles(program) {
        const bucketKey = this.bucketKey;
        for (const path of this.sourceFiles.keys()) {
            if (program.getSourceFileByPath(path) === undefined) {
                SharedRegistry.releaseDocumentWithKey(path, bucketKey);
            }
        }
    }
    releaseAll() {
        const { bucketKey } = this;
        const paths = this.sourceFiles.keys();
        for (const path of paths) {
            SharedRegistry.releaseDocumentWithKey(path, bucketKey);
        }
        this.sourceFiles.clear();
    }
    resolve(fileName) {
        return this.resolver.resolve(fileName);
    }
    getSourceFileByResolution(resolution, fileName, path) {
        const content = readFileResolution(resolution);
        if (content) {
            return this.getOrUpdateSourceFile(fileName, path, content);
        }
    }
    getOrUpdateSourceFile(fileName, path, content) {
        const existing = this.sourceFiles.get(path);
        if (existing) {
            return this.updateSourceFile(existing, fileName, path, content);
        }
        else {
            return this.createSourceFile(fileName, path, content);
        }
    }
    updateSourceFile(existing, fileName, path, content) {
        const { version } = content;
        if (existing.version === version) {
            return existing.sourceFile;
        }
        const { options, bucketKey } = this;
        const sourceFile = SharedRegistry.updateDocumentWithKey(fileName, path, options, bucketKey, snapshot(content.buffer), version);
        existing.sourceFile = sourceFile;
        existing.version = version;
        return sourceFile;
    }
    createSourceFile(fileName, path, content) {
        const { options, bucketKey, sourceFiles } = this;
        const { buffer, version } = content;
        const sourceFile = SharedRegistry.acquireDocumentWithKey(fileName, path, options, bucketKey, snapshot(buffer), version);
        sourceFiles.set(path, { sourceFile, version });
        return sourceFile;
    }
}
function snapshot(buffer) {
    return ts.ScriptSnapshot.fromString(buffer.toString("utf8"));
}
//# sourceMappingURL=source-cache.js.map