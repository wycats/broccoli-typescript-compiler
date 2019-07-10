import { Diagnostic } from "typescript";
import { DiagnosticsHandler, NormalizedOptions } from "./interfaces";
export default class DiagnosticsHandlerImpl implements DiagnosticsHandler {
    private throwOnError;
    private host;
    private write;
    constructor(options: NormalizedOptions);
    setWrite(write: (s: string) => void): void;
    check(diagnostics: Diagnostic | Diagnostic[] | undefined, throwOnError?: boolean): boolean;
    format(diagnostics: Diagnostic[]): string;
}
