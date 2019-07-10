import { getDefaultLibFileName, NewLineKind, sys, } from "typescript";
import { defaultLibLocation, getCanonicalFileName, toCanonicalPath, useCaseSensitiveFileNames, } from "../fs/path-utils";
export default function createCompilerHost(workingPath, input, sourceCache, compilerOptions) {
    const newLine = getNewLine(compilerOptions);
    return {
        directoryExists: path => input.directoryExists(path),
        fileExists: path => input.fileExists(path),
        getCanonicalFileName,
        getCurrentDirectory: () => workingPath,
        getDefaultLibFileName: options => toCanonicalPath(getDefaultLibFileName(options), defaultLibLocation),
        getDefaultLibLocation: () => defaultLibLocation,
        getDirectories: path => input.getDirectories(path),
        getNewLine: () => newLine,
        getSourceFile: fileName => sourceCache.getSourceFile(fileName),
        getSourceFileByPath: (fileName, path) => sourceCache.getSourceFileByPath(fileName, path),
        readFile: path => input.readFile(path),
        realpath: path => input.realpath(path),
        trace: s => sys.write(s + newLine),
        useCaseSensitiveFileNames: () => useCaseSensitiveFileNames,
        writeFile: () => {
            // we provide a write file on emit.
            throw new Error("compiler host does not write output");
        },
    };
}
function getNewLine(options) {
    let newLine;
    if (options.newLine === undefined) {
        newLine = sys.newLine;
    }
    else {
        newLine = options.newLine === NewLineKind.LineFeed ? "\n" : "\r\n";
    }
    return newLine;
}
//# sourceMappingURL=create-compiler-host.js.map