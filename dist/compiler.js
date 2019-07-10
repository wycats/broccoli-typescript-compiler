import * as ts from "typescript";
import ConfigParser from "./compiler/config-parser";
import createCompilerHost from "./compiler/create-compiler-host";
import Input from "./compiler/input-io";
import OutputPatcher from "./compiler/output-patcher";
import PathResolver from "./compiler/path-resolver";
import SourceCache from "./compiler/source-cache";
import { normalizePath, relativePathWithin, toAbsolutePath, } from "./fs/path-utils";
import { heimdall } from "./helpers";
export default class Compiler {
    constructor(inputPath, outputPath, options, diagnosticsHandler) {
        this.inputPath = inputPath;
        this.outputPath = outputPath;
        this.options = options;
        this.diagnosticsHandler = diagnosticsHandler;
        const workingPath = (this.workingPath = options.workingPath);
        const rootPath = (this.rootPath = options.rootPath);
        this.buildPath = options.buildPath;
        const resolver = (this.resolver = new PathResolver(rootPath, inputPath));
        const input = (this.input = new Input(resolver));
        this.configParser = new ConfigParser(options.projectPath, options.rawConfig, options.configFileName, options.compilerOptions, workingPath, input);
        this.output = new OutputPatcher(outputPath);
    }
    compile() {
        const config = this.parseConfig();
        const sourceCache = this.getSourceCache(config.options);
        const program = this.createProgram(config, sourceCache);
        this.emitDiagnostics(program);
        sourceCache.releaseUnusedSourceFiles(program);
        this.emitProgram(program, this.resolveBuildPath(config.options));
        this.patchOutput();
        this.resetCaches();
    }
    parseConfig() {
        const token = heimdall.start("TypeScript:parseConfig");
        const config = this.configParser.parseConfig();
        heimdall.stop(token);
        return config;
    }
    getSourceCache(options) {
        let sourceCache = this.sourceCache;
        if (sourceCache === undefined) {
            sourceCache = this.sourceCache = new SourceCache(this.resolver, options);
        }
        else {
            sourceCache.updateOptions(options);
        }
        return sourceCache;
    }
    createProgram(config, sourceCache) {
        const token = heimdall.start("TypeScript:createProgram");
        const host = createCompilerHost(this.workingPath, this.input, sourceCache, config.options);
        const oldProgram = this.program;
        const program = ts.createProgram(config.fileNames, config.options, host, oldProgram);
        this.program = program;
        heimdall.stop(token);
        return program;
    }
    emitDiagnostics(program) {
        // this is where bindings are resolved and typechecking is done
        const token = heimdall.start("TypeScript:emitDiagnostics");
        const diagnostics = ts.getPreEmitDiagnostics(program);
        heimdall.stop(token);
        this.diagnosticsHandler.check(diagnostics);
    }
    resolveBuildPath(options) {
        if (this.buildPath !== undefined) {
            return this.buildPath;
        }
        if (options.outDir !== undefined) {
            return normalizePath(options.outDir);
        }
        return this.rootPath;
    }
    emitProgram(program, buildPath) {
        const token = heimdall.start("TypeScript:emitProgram");
        const { output } = this;
        const emitResult = program.emit(undefined, (fileName, data) => {
            /* tslint:disable:no-console */
            // the fileName is absolute but not normalized if outDir is not normalized
            const relativePath = relativePathWithin(buildPath, toAbsolutePath(fileName, this.workingPath));
            if (relativePath) {
                output.add(relativePath, data);
            }
        });
        heimdall.stop(token);
        this.diagnosticsHandler.check(emitResult.diagnostics);
    }
    patchOutput() {
        const token = heimdall.start("TypeScript:patchOutput");
        this.output.patch();
        heimdall.stop(token);
    }
    resetCaches() {
        this.resolver.reset();
        this.input.reset();
    }
}
//# sourceMappingURL=compiler.js.map