import * as ts from "typescript";
import { getDirectoryPath } from "../fs/path-utils";
import createParseConfigHost from "./create-parse-config-host";
export default class ConfigParser {
    constructor(projectPath, rawConfig, configFileName, compilerOptions, workingPath, input) {
        this.projectPath = projectPath;
        this.rawConfig = rawConfig;
        this.configFileName = configFileName;
        this.compilerOptions = compilerOptions;
        this.host = createParseConfigHost(workingPath, input);
    }
    parseConfig() {
        const configFileName = this.resolveConfigFileName();
        const basePath = this.getBasePath(configFileName);
        const existingOptions = this.convertExistingOptions(basePath);
        const result = this.parseConfigContent(configFileName, basePath, existingOptions.options);
        if (existingOptions.errors.length > 0) {
            result.errors = existingOptions.errors.concat(result.errors);
        }
        if (result.options.noEmit === true) {
            result.options.noEmit = false;
        }
        return result;
    }
    resolveConfigFileName() {
        if (this.rawConfig !== undefined) {
            return;
        }
        return ts.findConfigFile(this.projectPath, this.host.fileExists, this.configFileName);
    }
    getBasePath(configFilePath) {
        if (configFilePath === undefined) {
            return this.projectPath;
        }
        return getDirectoryPath(configFilePath);
    }
    convertExistingOptions(basePath) {
        const { compilerOptions } = this;
        if (compilerOptions === undefined) {
            return {
                errors: [],
                options: undefined,
            };
        }
        return ts.convertCompilerOptionsFromJson(this.compilerOptions, basePath);
    }
    readConfigSourceFile(configFilePath) {
        if (configFilePath === undefined) {
            return;
        }
        const configFileText = this.host.readFile(configFilePath);
        if (configFileText === undefined) {
            throw new Error(`File '${configFilePath}' not found.`);
        }
        return ts.parseJsonText(configFilePath, configFileText);
    }
    parseConfigContent(configFileName, basePath, existingOptions) {
        const configSourceFile = this.readConfigSourceFile(configFileName);
        if (configSourceFile === undefined) {
            return ts.parseJsonConfigFileContent(this.rawConfig || {}, this.host, basePath, existingOptions);
        }
        return ts.parseJsonSourceFileConfigFileContent(configSourceFile, this.host, basePath, existingOptions, configFileName);
    }
}
//# sourceMappingURL=config-parser.js.map