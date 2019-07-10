/// <reference types="node" />
import { Stats } from "fs";
import { AbsolutePath, CanonicalPath, DirEntries, FileContent, PathResolver, Resolution } from "../interfaces";
export declare function readFile(path: AbsolutePath): FileContent;
export declare function readFileResolution(resolution: Resolution): FileContent | undefined;
export declare function stat(path: AbsolutePath): Stats | undefined;
export declare function readdir(path: CanonicalPath, resolver: PathResolver): DirEntries;
