"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_test_helper_1 = require("broccoli-test-helper");
const broccoli_typescript_compiler_1 = require("broccoli-typescript-compiler");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
// tslint:disable:max-classes-per-file
class ProjectRunner {
    constructor(config) {
        const rootDir = path.resolve(config.typescriptDir);
        this.rootDir = rootDir;
        this.projectJsonDir = path.join(rootDir, "tests/cases/project");
    }
    each(callback) {
        const { rootDir, projectJsonDir } = this;
        const entries = fs.readdirSync(projectJsonDir);
        for (const entry of entries) {
            const extname = path.extname(entry);
            if (extname === ".json") {
                const configPath = path.join(projectJsonDir, entry);
                const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
                const basename = path.basename(entry, extname);
                if (this.shouldSkip(basename, config)) {
                    continue;
                }
                callback(new Project(rootDir, basename, config));
            }
        }
    }
    shouldSkip(basename, config) {
        return (basename === "invalidRootFile" ||
            /^mapRootRelativePath/.test(basename) ||
            /^sourceRootRelativePath/.test(basename) ||
            (/^maprootUrl/.test(basename) &&
                !/^maprootUrlsourcerootUrl/.test(basename)) ||
            /^maprootUrlSubfolder/.test(basename) ||
            /^referenceResolutionRelativePaths/.test(basename) ||
            basename === "rootDirectoryWithSourceRoot" ||
            !config.baselineCheck ||
            config.resolveMapRoot ||
            config.resolveSourceRoot);
    }
}
exports.default = ProjectRunner;
class Project {
    constructor(rootDir, basename, config) {
        this.rootDir = rootDir;
        this.basename = basename;
        this.config = config;
    }
    each(callback) {
        callback(new ProjectWithModule(this, "amd"));
        callback(new ProjectWithModule(this, "commonjs"));
    }
    get dir() {
        return path.join(this.rootDir, this.config.projectRoot);
    }
    get inputFiles() {
        return this.config.inputFiles;
    }
    get compilerOptions() {
        const { config } = this;
        const compilerOptions = {};
        ts.optionDeclarations.forEach(opt => {
            const name = opt.name;
            if (name in config) {
                compilerOptions[name] = config[name];
            }
        });
        return compilerOptions;
    }
}
exports.Project = Project;
class ProjectWithModule {
    constructor(project, module) {
        this.project = project;
        this.module = module;
    }
    get baselineDir() {
        return broccoli_test_helper_1.createReadableDir(path.join(this.project.rootDir, "tests/baselines/reference/project", this.project.basename, this.module === "amd" ? "amd" : "node"));
    }
    get compilerOptions() {
        return Object.assign(this.project.compilerOptions, {
            module: this.module,
            newLine: "CRLF",
            typeRoots: [],
        });
    }
    get pluginConfig() {
        const { project } = this;
        const inputFiles = project.inputFiles;
        const config = {
            buildPath: this.project.dir,
            compilerOptions: this.compilerOptions,
            workingPath: this.project.dir,
        };
        if (inputFiles) {
            config.compilerOptions.moduleResolution = "classic";
            config.tsconfig = {
                files: inputFiles,
            };
        }
        else {
            config.projectPath = project.config.project;
        }
        return config;
    }
    get baseline() {
        return new Baseline(this.baselineDir.read(), this.project.basename);
    }
}
exports.ProjectWithModule = ProjectWithModule;
class Baseline {
    constructor(tree, basename) {
        const configName = basename + ".json";
        const errorsName = basename + ".errors.txt";
        const sourcemapName = basename + "sourcemap.txt";
        const config = JSON.parse(tree[configName]);
        this.config = config;
        this.errors = processErrors(tree[errorsName]);
        this.sourcemap = tree[errorsName];
        delete tree[configName];
        delete tree[errorsName];
        delete tree[sourcemapName];
        this.output = cleanExpectedTree(tree, config.emittedFiles);
    }
}
exports.Baseline = Baseline;
function processErrors(errors) {
    if (typeof errors === "string") {
        return (errors
            .toLowerCase()
            .split(/^(?:!!!|====)/m)[0]
            // the project runner in typescript loads the tsconfig
            // in the runner itself, we don't so we need to remove
            // message about adding a tsconfig may help
            .replace(/^.*?adding a tsconfig\.json file will help organize projects.*?$/m, "")
            .split(/(?:\r\n|\n)+/)
            .join(ts.sys.newLine));
    }
}
function normalizeTree(baseline) {
    const normalized = {};
    const files = Object.keys(baseline);
    for (const file of files) {
        let value = baseline[file];
        if (typeof value === "object" && value !== null) {
            value = normalizeTree(value);
        }
        normalized[broccoli_typescript_compiler_1.normalizePath(file)] = value;
    }
    return normalized;
}
function cleanExpectedTree(baseline, emittedFiles) {
    const clean = {};
    if (emittedFiles) {
        const normalized = normalizeTree(baseline);
        for (const emittedFile of emittedFiles) {
            const parts = broccoli_typescript_compiler_1.normalizePath(emittedFile).split("/");
            let src = normalized;
            let target = clean;
            for (const part of parts) {
                if (typeof target !== "object" ||
                    target === null ||
                    typeof src !== "object" ||
                    src === null) {
                    continue;
                }
                if (part === "..") {
                    // we can let you escape the outputPath
                    // TODO, maybe support compilerOptions.project as a way to make this pass
                    // tslint:disable:no-console
                    console.warn(emittedFile);
                    break;
                }
                const value = src[part];
                if (typeof value === "string") {
                    target[part] = value;
                }
                else if (target[part] === undefined) {
                    target[part] = {};
                }
                src = value;
                target = target[part];
            }
        }
    }
    return clean;
}
//# sourceMappingURL=typescript-project-runner.js.map