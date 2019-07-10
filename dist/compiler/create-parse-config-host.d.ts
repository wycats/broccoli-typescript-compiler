import { ParseConfigHost } from "typescript";
import { AbsolutePath } from "../interfaces";
import InputIO from "./input-io";
export default function createParseConfigHost(workingPath: AbsolutePath, input: InputIO): ParseConfigHost;
declare module "typescript" {
    interface FileSystemEntries {
        files: ReadonlyArray<string>;
        directories: ReadonlyArray<string>;
    }
    function matchFiles(path: string, extensions: ReadonlyArray<string>, excludes: ReadonlyArray<string>, includes: ReadonlyArray<string>, useCaseSensitiveFileNames: boolean, currentDirectory: string, depth: number | undefined, getFileSystemEntries: (path: string) => FileSystemEntries, realpath: (path: string) => string): string[];
}
