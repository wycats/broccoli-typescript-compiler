import * as ts from "typescript";
import { AbsolutePath, CanonicalPath } from "../interfaces";
export declare const useCaseSensitiveFileNames: boolean;
export declare const getCanonicalFileName: (fileName: string) => string;
export declare const defaultLibLocation: ts.Path;
export declare function normalizePath(path: string): string;
export declare function isWithin(rootPath: AbsolutePath, path: AbsolutePath): boolean;
export declare function relativePathWithin(root: AbsolutePath, path: AbsolutePath): string | undefined;
export declare function toCanonicalPath(fileName: string, basePath?: AbsolutePath | CanonicalPath): CanonicalPath;
export declare function toAbsolutePath(fileName: string, basePath?: AbsolutePath): AbsolutePath;
export { getDirectoryPath } from "typescript";
declare module "typescript" {
    function getDirectoryPath(path: ts.Path): ts.Path;
    function getDirectoryPath(path: string): string;
    function normalizePath(path: string): string;
    function toPath(fileName: string, basePath: string, getCanonicalFileName: (path: string) => string): ts.Path;
}
