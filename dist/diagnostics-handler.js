import { formatDiagnostics, sys, } from "typescript";
import { getCanonicalFileName } from "./fs/path-utils";
export default class DiagnosticsHandlerImpl {
    constructor(options) {
        this.write = sys.write;
        this.throwOnError = options.throwOnError;
        this.host = createFormatDiagnosticsHost(options.workingPath);
    }
    setWrite(write) {
        this.write = write;
    }
    check(diagnostics, throwOnError) {
        const normalized = normalize(diagnostics);
        if (normalized === undefined) {
            return false;
        }
        const message = this.format(normalized);
        if (this.throwOnError || throwOnError === true) {
            throw new Error(message);
        }
        this.write(message);
        return true;
    }
    format(diagnostics) {
        return formatDiagnostics(diagnostics, this.host);
    }
}
function normalize(diagnostics) {
    if (diagnostics === undefined) {
        return undefined;
    }
    if (Array.isArray(diagnostics)) {
        return diagnostics.length === 0 ? undefined : diagnostics;
    }
    return [diagnostics];
}
function createFormatDiagnosticsHost(rootPath) {
    const newLine = sys.newLine;
    return {
        getCanonicalFileName,
        getCurrentDirectory: () => rootPath,
        getNewLine: () => newLine,
    };
}
//# sourceMappingURL=diagnostics-handler.js.map