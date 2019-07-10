import * as ts from "typescript";
import { AbsolutePath, CompilerOptionsConfig, TypescriptConfig } from "../interfaces";
import Input from "./input-io";
export default class ConfigParser {
    private projectPath;
    private rawConfig;
    private configFileName;
    private compilerOptions;
    private host;
    constructor(projectPath: AbsolutePath, rawConfig: TypescriptConfig | undefined, configFileName: string | undefined, compilerOptions: CompilerOptionsConfig | undefined, workingPath: AbsolutePath, input: Input);
    parseConfig(): ts.ParsedCommandLine;
    private resolveConfigFileName;
    private getBasePath;
    private convertExistingOptions;
    private readConfigSourceFile;
    private parseConfigContent;
}
