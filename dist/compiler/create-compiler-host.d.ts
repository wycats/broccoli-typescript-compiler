import { CompilerHost, CompilerOptions } from "typescript";
import { AbsolutePath } from "../interfaces";
import InputIO from "./input-io";
import SourceCache from "./source-cache";
export default function createCompilerHost(workingPath: AbsolutePath, input: InputIO, sourceCache: SourceCache, compilerOptions: CompilerOptions): CompilerHost;
