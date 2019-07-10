import * as ts from "typescript";
import { CanonicalPath, PathResolver } from "../interfaces";
export default class SourceCache {
    private resolver;
    private options;
    private bucketKey;
    private sourceFiles;
    constructor(resolver: PathResolver, options: ts.CompilerOptions);
    updateOptions(options: ts.CompilerOptions): void;
    getSourceFile(fileName: string): ts.SourceFile | undefined;
    getSourceFileByPath(fileName: string, path: CanonicalPath): ts.SourceFile | undefined;
    releaseUnusedSourceFiles(program: ts.Program): void;
    releaseAll(): void;
    private resolve;
    private getSourceFileByResolution;
    private getOrUpdateSourceFile;
    private updateSourceFile;
    private createSourceFile;
}
