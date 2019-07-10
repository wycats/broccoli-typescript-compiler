'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ts = require('typescript');
var crypto = require('crypto');
var fs = require('fs');

var useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
var getCanonicalFileName = ts.sys.useCaseSensitiveFileNames
    ? function (fileName) { return fileName; }
    : function (fileName) { return fileName.toLowerCase(); };
var defaultLibLocation = ts.getDirectoryPath(toCanonicalPath(ts.sys.getExecutingFilePath()));
function normalizePath(path) {
    if (path.length === 0) {
        return path;
    }
    return trimTrailingSlash(ts.normalizePath(path));
}
function isWithin(rootPath, path) {
    return (path.length > rootPath.length &&
        path.lastIndexOf(rootPath, 0) === 0 &&
        path.charCodeAt(rootPath.length) === 47 /* Slash */);
}
function relativePathWithin(root, path) {
    var relativePath;
    if (path.length > root.length &&
        path.lastIndexOf(root, 0) === 0 &&
        path.charCodeAt(root.length) === 47 /* Slash */) {
        relativePath = path.substring(root.length + 1);
    }
    else if (path === root) {
        relativePath = "";
    }
    return relativePath;
}
function toCanonicalPath(fileName, basePath) {
    var p = ts.toPath(fileName, basePath === undefined ? currentDirectory() : basePath, getCanonicalFileName);
    return trimTrailingSlash(p);
}
function toAbsolutePath(fileName, basePath) {
    var p = ts.toPath(fileName, basePath === undefined ? currentDirectory() : basePath, function (name) { return name; });
    return trimTrailingSlash(p);
}
function trimTrailingSlash(path) {
    if (path.charCodeAt(path.length - 1) === 47 /* Slash */) {
        return path.slice(0, path.length - 1);
    }
    return path;
}
function currentDirectory() {
    return normalizePath(process.cwd());
}

function createParseConfigHost(workingPath, input) {
    function getFileSystemEntries(path) {
        return input.getFileSystemEntries(path);
    }
    function realpath(path) {
        try {
            return input.realpath(path) || path;
        }
        catch (_a) {
            return path;
        }
    }
    function readDirectory(rootDir, extensions, excludes, includes, depth) {
        return ts.matchFiles(rootDir, extensions, excludes, includes, useCaseSensitiveFileNames, workingPath, depth, getFileSystemEntries, realpath);
    }
    function fileExists(path) {
        return input.fileExists(path);
    }
    function readFile(path) {
        return input.readFile(path);
    }
    return {
        fileExists: fileExists,
        readDirectory: readDirectory,
        readFile: readFile,
        useCaseSensitiveFileNames: useCaseSensitiveFileNames,
    };
}

var ConfigParser = function ConfigParser(projectPath, rawConfig, configFileName, compilerOptions, workingPath, input) {
    this.projectPath = projectPath;
    this.rawConfig = rawConfig;
    this.configFileName = configFileName;
    this.compilerOptions = compilerOptions;
    this.host = createParseConfigHost(workingPath, input);
};
ConfigParser.prototype.parseConfig = function parseConfig () {
    var configFileName = this.resolveConfigFileName();
    var basePath = this.getBasePath(configFileName);
    var existingOptions = this.convertExistingOptions(basePath);
    var result = this.parseConfigContent(configFileName, basePath, existingOptions.options);
    if (existingOptions.errors.length > 0) {
        result.errors = existingOptions.errors.concat(result.errors);
    }
    if (result.options.noEmit === true) {
        result.options.noEmit = false;
    }
    return result;
};
ConfigParser.prototype.resolveConfigFileName = function resolveConfigFileName () {
    if (this.rawConfig !== undefined) {
        return;
    }
    return ts.findConfigFile(this.projectPath, this.host.fileExists, this.configFileName);
};
ConfigParser.prototype.getBasePath = function getBasePath (configFilePath) {
    if (configFilePath === undefined) {
        return this.projectPath;
    }
    return ts.getDirectoryPath(configFilePath);
};
ConfigParser.prototype.convertExistingOptions = function convertExistingOptions (basePath) {
    var ref = this;
        var compilerOptions = ref.compilerOptions;
    if (compilerOptions === undefined) {
        return {
            errors: [],
            options: undefined,
        };
    }
    return ts.convertCompilerOptionsFromJson(this.compilerOptions, basePath);
};
ConfigParser.prototype.readConfigSourceFile = function readConfigSourceFile (configFilePath) {
    if (configFilePath === undefined) {
        return;
    }
    var configFileText = this.host.readFile(configFilePath);
    if (configFileText === undefined) {
        throw new Error(("File '" + configFilePath + "' not found."));
    }
    return ts.parseJsonText(configFilePath, configFileText);
};
ConfigParser.prototype.parseConfigContent = function parseConfigContent (configFileName, basePath, existingOptions) {
    var configSourceFile = this.readConfigSourceFile(configFileName);
    if (configSourceFile === undefined) {
        return ts.parseJsonConfigFileContent(this.rawConfig || {}, this.host, basePath, existingOptions);
    }
    return ts.parseJsonSourceFileConfigFileContent(configSourceFile, this.host, basePath, existingOptions, configFileName);
};

function createCompilerHost(workingPath, input, sourceCache, compilerOptions) {
    var newLine = getNewLine(compilerOptions);
    return {
        directoryExists: function (path) { return input.directoryExists(path); },
        fileExists: function (path) { return input.fileExists(path); },
        getCanonicalFileName: getCanonicalFileName,
        getCurrentDirectory: function () { return workingPath; },
        getDefaultLibFileName: function (options) { return toCanonicalPath(ts.getDefaultLibFileName(options), defaultLibLocation); },
        getDefaultLibLocation: function () { return defaultLibLocation; },
        getDirectories: function (path) { return input.getDirectories(path); },
        getNewLine: function () { return newLine; },
        getSourceFile: function (fileName) { return sourceCache.getSourceFile(fileName); },
        getSourceFileByPath: function (fileName, path) { return sourceCache.getSourceFileByPath(fileName, path); },
        readFile: function (path) { return input.readFile(path); },
        realpath: function (path) { return input.realpath(path); },
        trace: function (s) { return ts.sys.write(s + newLine); },
        useCaseSensitiveFileNames: function () { return useCaseSensitiveFileNames; },
        writeFile: function () {
            // we provide a write file on emit.
            throw new Error("compiler host does not write output");
        },
    };
}
function getNewLine(options) {
    var newLine;
    if (options.newLine === undefined) {
        newLine = ts.sys.newLine;
    }
    else {
        newLine = options.newLine === ts.NewLineKind.LineFeed ? "\n" : "\r\n";
    }
    return newLine;
}

var Cache = function Cache(delegate) {
    this.delegate = delegate;
    this.hits = 0;
    this.misses = 0;
    this.store = new Map();
};
Cache.prototype.get = function get (key) {
    var cacheKey = this.delegate.cacheKey(key);
    var value = this.store.get(cacheKey);
    if (value === undefined) {
        this.misses++;
        value = this.delegate.create(key);
        this.store.set(cacheKey, value);
    }
    else {
        this.hits++;
    }
    return value;
};
Cache.prototype.clear = function clear () {
    this.store.clear();
};

function readFile(path) {
    var buffer = fs.readFileSync(path);
    var hash = crypto.createHash("sha1");
    hash.update(buffer);
    return { buffer: buffer, version: hash.digest("hex") };
}
function readFileResolution(resolution) {
    var path;
    if (resolution.isFile()) {
        if (resolution.isInput()) {
            path = resolution.pathInInput;
        }
        else {
            path = resolution.path;
        }
    }
    if (path) {
        return readFile(path);
    }
}
function stat(path) {
    try {
        return fs.statSync(path);
    }
    catch (e) {
        if (e.code === "ENOENT" || e.code === "EACCES") {
            return;
        }
        throw e;
    }
}
function readdir(path, resolver) {
    var prefix = path + "/";
    var files = [];
    var directories = [];
    for (var i = 0, list = fs.readdirSync(path).sort(); i < list.length; i += 1) {
        var entry = list[i];

        var resolution = resolver.resolve(prefix + entry);
        if (resolution.isFile()) {
            files.push(entry);
        }
        else if (resolution.isDirectory()) {
            directories.push(entry);
        }
    }
    return { files: files, directories: directories };
}

var DirEntriesCacheDelegate = function DirEntriesCacheDelegate(resolver) {
    this.resolver = resolver;
};
DirEntriesCacheDelegate.prototype.cacheKey = function cacheKey (path) {
    return path;
};
DirEntriesCacheDelegate.prototype.create = function create (path) {
    return readdir(path, this.resolver);
};

var DirEntriesCache = (function (Cache$$1) {
    function DirEntriesCache(resolver) {
        Cache$$1.call(this, new DirEntriesCacheDelegate(resolver));
    }

    if ( Cache$$1 ) DirEntriesCache.__proto__ = Cache$$1;
    DirEntriesCache.prototype = Object.create( Cache$$1 && Cache$$1.prototype );
    DirEntriesCache.prototype.constructor = DirEntriesCache;

    return DirEntriesCache;
}(Cache));

var Input = function Input(resolver) {
    this.resolver = resolver;
    this.realpathCache = Object.create(null);
    this.entriesCache = new DirEntriesCache(resolver);
};
Input.prototype.fileExists = function fileExists (path) {
    return this.resolve(path).isFile();
};
Input.prototype.directoryExists = function directoryExists (path) {
    return this.resolve(path).isDirectory();
};
/**
 * Used for type resolution.
 *
 * Will merge the view of input path and root path.
 */
Input.prototype.getDirectories = function getDirectories (path) {
        var this$1 = this;

    var resolution = this.resolve(path);
    var directories;
    if (resolution.isDirectory()) {
        if (resolution.isInput()) {
            directories = this.readdir(resolution.canonicalPathInInput).directories;
            if (resolution.isMerged()) {
                for (var other in this$1.readdir(resolution.canonicalPath)
                    .directories) {
                    if (directories.indexOf(other) === -1) {
                        directories.push(other);
                    }
                }
            }
        }
        else {
            directories = this.readdir(resolution.canonicalPath).directories;
        }
    }
    else {
        directories = [];
    }
    return directories;
};
/**
 * Used by config parser for matching input.
 *
 * Unlike getDirectories which merges the view of input node and root.
 * We only allow this to return entries for things within the
 * broccoli input node.
 */
Input.prototype.getFileSystemEntries = function getFileSystemEntries (path) {
    var resolution = this.resolve(path);
    var entries;
    if (resolution.isDirectory() && resolution.isInput()) {
        entries = this.readdir(resolution.canonicalPathInInput);
    }
    else {
        entries = { files: [], directories: [] };
    }
    return entries;
};
Input.prototype.readFile = function readFile (path) {
    var resolution = this.resolve(path);
    var resolved;
    if (resolution.isFile()) {
        if (resolution.isInput()) {
            resolved = resolution.pathInInput;
        }
        else {
            resolved = resolution.path;
        }
    }
    if (resolved !== undefined) {
        return ts.sys.readFile(resolved);
    }
};
Input.prototype.relativePath = function relativePath (path) {
    return this.resolve(path).relativePath;
};
Input.prototype.realpath = function realpath (path) {
    var resolution = this.resolve(path);
    if (resolution.isInput()) {
        return resolution.path;
    }
    else if (resolution.exists()) {
        var realpath = fs.realpathSync(resolution.path, this.realpathCache);
        return this.resolve(realpath).path;
    }
};
Input.prototype.reset = function reset () {
    this.entriesCache.clear();
    this.realpathCache = Object.create(null);
};
Input.prototype.resolve = function resolve (path) {
    return this.resolver.resolve(path);
};
Input.prototype.readdir = function readdir (path) {
    return this.entriesCache.get(path);
};

var FSTree = require("fs-tree-diff");
var BroccoliPlugin = require("broccoli-plugin");
var walkSync = require("walk-sync");
var md5Hex = require("md5-hex");
var heimdall = require("heimdalljs");

var OutputPatcher = function OutputPatcher(outputPath) {
    this.outputPath = outputPath;
    this.entries = [];
    this.contents = new Map();
    this.lastTree = undefined;
    this.isUnchanged = function (entryA, entryB) {
        if (entryA.isDirectory() && entryB.isDirectory()) {
            return true;
        }
        if (entryA.mode === entryB.mode && entryA.checksum === entryB.checksum) {
            return true;
        }
        return false;
    };
};
// relativePath should be without leading '/' and use forward slashes
OutputPatcher.prototype.add = function add (relativePath, content) {
    this.entries.push(new Entry(this.outputPath, relativePath, md5Hex(content)));
    this.contents.set(relativePath, content);
};
OutputPatcher.prototype.patch = function patch () {
    try {
        this.lastTree = this._patch();
    }
    catch (e) {
        // walkSync(output);
        this.lastTree = undefined;
        throw e;
    }
    finally {
        this.entries = [];
        this.contents = new Map();
    }
};
OutputPatcher.prototype._patch = function _patch () {
    var entries = this.entries;
    var lastTree = this.lastTree;
    var isUnchanged = this.isUnchanged;
    var outputPath = this.outputPath;
    var contents = this.contents;
    var nextTree = FSTree.fromEntries(entries, { sortAndExpand: true });
    if (!lastTree) {
        lastTree = FSTree.fromEntries(walkSync.entries(outputPath));
    }
    var patch = lastTree.calculatePatch(nextTree, isUnchanged);
    patch.forEach(function (change) {
        var op = change[0];
        var path = change[1];
        var entry = change[2];
        switch (op) {
            case "mkdir":
                // the expanded dirs don't have a base
                fs.mkdirSync(outputPath + "/" + path);
                break;
            case "rmdir":
                // the expanded dirs don't have a base
                fs.rmdirSync(outputPath + "/" + path);
                break;
            case "unlink":
                fs.unlinkSync(entry.fullPath);
                break;
            case "create":
            case "change":
                fs.writeFileSync(entry.fullPath, contents.get(path));
                break;
            default:
                throw new Error(("unrecognized case " + op));
        }
    });
    return nextTree;
};
/* tslint:disable:max-classes-per-file */
var Entry = function Entry(basePath, relativePath, checksum) {
    this.basePath = basePath;
    this.relativePath = relativePath;
    this.checksum = checksum;
    this.mode = 0;
    this.size = 0;
    this.mtime = new Date();
    this.fullPath = basePath + "/" + relativePath;
    this.checksum = checksum;
};
Entry.prototype.isDirectory = function isDirectory () {
    return false;
};

function parsePath(rootPath, inputPath, rawPath) {
    var path = toAbsolutePath(rawPath, rootPath);
    var pathInInput;
    var relativePath = relativePathWithin(rootPath, path);
    if (relativePath === undefined) {
        relativePath = relativePathWithin(inputPath, path);
        if (relativePath !== undefined) {
            pathInInput = path;
            path = toAbsolutePath(relativePath, rootPath);
        }
    }
    else {
        pathInInput = toAbsolutePath(relativePath, inputPath);
    }
    var canonicalPath = toCanonicalPath(path);
    var canonicalPathInInput = pathInInput && toCanonicalPath(pathInInput);
    return {
        canonicalPath: canonicalPath,
        canonicalPathInInput: canonicalPathInInput,
        path: path,
        pathInInput: pathInInput,
        relativePath: relativePath,
    };
}

var PathInfoCacheDelegate = function PathInfoCacheDelegate(rootPath, inputPath) {
    this.rootPath = rootPath;
    this.inputPath = inputPath;
};
PathInfoCacheDelegate.prototype.cacheKey = function cacheKey (key) {
    return toCanonicalPath(key, this.rootPath);
};
PathInfoCacheDelegate.prototype.create = function create (key) {
    return parsePath(this.rootPath, this.inputPath, key);
};

var PathInfoCache = (function (Cache$$1) {
    function PathInfoCache(rootPath, inputPath) {
        Cache$$1.call(this, new PathInfoCacheDelegate(rootPath, inputPath));
    }

    if ( Cache$$1 ) PathInfoCache.__proto__ = Cache$$1;
    PathInfoCache.prototype = Object.create( Cache$$1 && Cache$$1.prototype );
    PathInfoCache.prototype.constructor = PathInfoCache;

    return PathInfoCache;
}(Cache));

function resolve(pathInfo) {
    var flags = 0 /* None */;
    var stats;
    var otherStats;
    if (pathInfo.pathInInput) {
        stats = stat(pathInfo.pathInInput);
        if (stats !== undefined) {
            flags |= 4 /* Input */;
        }
    }
    if (stats === undefined) {
        stats = stat(pathInfo.path);
    }
    if (stats !== undefined) {
        flags |= stats.isDirectory() ? 2 /* Dir */ : 1 /* File */;
    }
    if ((flags & 6 /* InputDir */) === 6 /* InputDir */) {
        otherStats = stat(pathInfo.path);
        if (otherStats !== undefined && otherStats.isDirectory()) {
            flags |= 8 /* Merge */;
        }
    }
    return new ResolutionImpl(pathInfo, stats, otherStats, flags);
}
var ResolutionImpl = function ResolutionImpl(pathInfo, stats, otherStats, flags) {
    this.stats = stats;
    this.otherStats = otherStats;
    this.flags = flags;
    this.canonicalPath = pathInfo.canonicalPath;
    this.canonicalPathInInput = pathInfo.canonicalPathInInput;
    this.path = pathInfo.path;
    this.pathInInput = pathInfo.pathInInput;
    this.relativePath = pathInfo.relativePath;
};
ResolutionImpl.prototype.isInput = function isInput () {
    return this.hasFlag(4 /* Input */);
};
ResolutionImpl.prototype.isFile = function isFile () {
    return this.hasFlag(1 /* File */);
};
ResolutionImpl.prototype.isDirectory = function isDirectory () {
    return this.hasFlag(2 /* Dir */);
};
ResolutionImpl.prototype.isMerged = function isMerged () {
    return this.hasFlag(1 /* File */);
};
ResolutionImpl.prototype.exists = function exists () {
    return this.stats !== undefined;
};
ResolutionImpl.prototype.hasFlag = function hasFlag (flag) {
    return (this.flags & flag) === flag;
};

var ResolutionCacheDelegate = function ResolutionCacheDelegate () {};

ResolutionCacheDelegate.prototype.cacheKey = function cacheKey (pathInfo) {
    return pathInfo.canonicalPath;
};
ResolutionCacheDelegate.prototype.create = function create (pathInfo) {
    return resolve(pathInfo);
};

var ResolutionCache = (function (Cache$$1) {
    function ResolutionCache() {
        Cache$$1.call(this, new ResolutionCacheDelegate());
    }

    if ( Cache$$1 ) ResolutionCache.__proto__ = Cache$$1;
    ResolutionCache.prototype = Object.create( Cache$$1 && Cache$$1.prototype );
    ResolutionCache.prototype.constructor = ResolutionCache;

    return ResolutionCache;
}(Cache));

var PathResolverImpl = function PathResolverImpl(rootPath, inputPath) {
    this.resolutionCache = new ResolutionCache();
    this.pathInfoCache = new PathInfoCache(rootPath, inputPath);
};
PathResolverImpl.prototype.resolve = function resolve (path) {
    var pathInfo = this.pathInfoCache.get(path);
    return this.resolutionCache.get(pathInfo);
};
PathResolverImpl.prototype.reset = function reset () {
    // PathInfo cache is not build specific
    // resolutions are
    this.resolutionCache.clear();
};

var SharedRegistry = ts.createDocumentRegistry();
var SourceCache = function SourceCache(resolver, options) {
    this.resolver = resolver;
    this.options = options;
    this.sourceFiles = new Map();
    this.bucketKey = SharedRegistry.getKeyForCompilationSettings(options);
};
SourceCache.prototype.updateOptions = function updateOptions (options) {
    var bucketKey = SharedRegistry.getKeyForCompilationSettings(options);
    this.options = options;
    if (this.bucketKey !== bucketKey) {
        this.releaseAll();
        this.bucketKey = bucketKey;
    }
};
SourceCache.prototype.getSourceFile = function getSourceFile (fileName) {
    var resolution = this.resolve(fileName);
    return this.getSourceFileByPath(fileName, resolution.canonicalPath);
};
SourceCache.prototype.getSourceFileByPath = function getSourceFileByPath (fileName, path) {
    var resolution = this.resolve(path);
    return this.getSourceFileByResolution(resolution, fileName, path);
};
SourceCache.prototype.releaseUnusedSourceFiles = function releaseUnusedSourceFiles (program) {
        var this$1 = this;

    var bucketKey = this.bucketKey;
    for (var i = 0, list = this$1.sourceFiles.keys(); i < list.length; i += 1) {
        var path = list[i];

            if (program.getSourceFileByPath(path) === undefined) {
            SharedRegistry.releaseDocumentWithKey(path, bucketKey);
        }
    }
};
SourceCache.prototype.releaseAll = function releaseAll () {
    var ref = this;
        var bucketKey = ref.bucketKey;
    var paths = this.sourceFiles.keys();
    for (var i = 0, list = paths; i < list.length; i += 1) {
        var path = list[i];

            SharedRegistry.releaseDocumentWithKey(path, bucketKey);
    }
    this.sourceFiles.clear();
};
SourceCache.prototype.resolve = function resolve (fileName) {
    return this.resolver.resolve(fileName);
};
SourceCache.prototype.getSourceFileByResolution = function getSourceFileByResolution (resolution, fileName, path) {
    var content = readFileResolution(resolution);
    if (content) {
        return this.getOrUpdateSourceFile(fileName, path, content);
    }
};
SourceCache.prototype.getOrUpdateSourceFile = function getOrUpdateSourceFile (fileName, path, content) {
    var existing = this.sourceFiles.get(path);
    if (existing) {
        return this.updateSourceFile(existing, fileName, path, content);
    }
    else {
        return this.createSourceFile(fileName, path, content);
    }
};
SourceCache.prototype.updateSourceFile = function updateSourceFile (existing, fileName, path, content) {
    var version = content.version;
    if (existing.version === version) {
        return existing.sourceFile;
    }
    var ref = this;
        var options = ref.options;
        var bucketKey = ref.bucketKey;
    var sourceFile = SharedRegistry.updateDocumentWithKey(fileName, path, options, bucketKey, snapshot(content.buffer), version);
    existing.sourceFile = sourceFile;
    existing.version = version;
    return sourceFile;
};
SourceCache.prototype.createSourceFile = function createSourceFile (fileName, path, content) {
    var ref = this;
        var options = ref.options;
        var bucketKey = ref.bucketKey;
        var sourceFiles = ref.sourceFiles;
    var buffer = content.buffer;
        var version = content.version;
    var sourceFile = SharedRegistry.acquireDocumentWithKey(fileName, path, options, bucketKey, snapshot(buffer), version);
    sourceFiles.set(path, { sourceFile: sourceFile, version: version });
    return sourceFile;
};
function snapshot(buffer) {
    return ts.ScriptSnapshot.fromString(buffer.toString("utf8"));
}

var Compiler = function Compiler(inputPath, outputPath, options, diagnosticsHandler) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.options = options;
    this.diagnosticsHandler = diagnosticsHandler;
    var workingPath = (this.workingPath = options.workingPath);
    var rootPath = (this.rootPath = options.rootPath);
    this.buildPath = options.buildPath;
    var resolver = (this.resolver = new PathResolverImpl(rootPath, inputPath));
    var input = (this.input = new Input(resolver));
    this.configParser = new ConfigParser(options.projectPath, options.rawConfig, options.configFileName, options.compilerOptions, workingPath, input);
    this.output = new OutputPatcher(outputPath);
};
Compiler.prototype.compile = function compile () {
    var config = this.parseConfig();
    var sourceCache = this.getSourceCache(config.options);
    var program = this.createProgram(config, sourceCache);
    this.emitDiagnostics(program);
    sourceCache.releaseUnusedSourceFiles(program);
    this.emitProgram(program, this.resolveBuildPath(config.options));
    this.patchOutput();
    this.resetCaches();
};
Compiler.prototype.parseConfig = function parseConfig () {
    var token = heimdall.start("TypeScript:parseConfig");
    var config = this.configParser.parseConfig();
    heimdall.stop(token);
    return config;
};
Compiler.prototype.getSourceCache = function getSourceCache (options) {
    var sourceCache = this.sourceCache;
    if (sourceCache === undefined) {
        sourceCache = this.sourceCache = new SourceCache(this.resolver, options);
    }
    else {
        sourceCache.updateOptions(options);
    }
    return sourceCache;
};
Compiler.prototype.createProgram = function createProgram (config, sourceCache) {
    var token = heimdall.start("TypeScript:createProgram");
    var host = createCompilerHost(this.workingPath, this.input, sourceCache, config.options);
    var oldProgram = this.program;
    var program = ts.createProgram(config.fileNames, config.options, host, oldProgram);
    this.program = program;
    heimdall.stop(token);
    return program;
};
Compiler.prototype.emitDiagnostics = function emitDiagnostics (program) {
    // this is where bindings are resolved and typechecking is done
    var token = heimdall.start("TypeScript:emitDiagnostics");
    var diagnostics = ts.getPreEmitDiagnostics(program);
    heimdall.stop(token);
    this.diagnosticsHandler.check(diagnostics);
};
Compiler.prototype.resolveBuildPath = function resolveBuildPath (options) {
    if (this.buildPath !== undefined) {
        return this.buildPath;
    }
    if (options.outDir !== undefined) {
        return normalizePath(options.outDir);
    }
    return this.rootPath;
};
Compiler.prototype.emitProgram = function emitProgram (program, buildPath) {
        var this$1 = this;

    var token = heimdall.start("TypeScript:emitProgram");
    var ref = this;
        var output = ref.output;
    var emitResult = program.emit(undefined, function (fileName, data) {
        /* tslint:disable:no-console */
        // the fileName is absolute but not normalized if outDir is not normalized
        var relativePath = relativePathWithin(buildPath, toAbsolutePath(fileName, this$1.workingPath));
        if (relativePath) {
            output.add(relativePath, data);
        }
    });
    heimdall.stop(token);
    this.diagnosticsHandler.check(emitResult.diagnostics);
};
Compiler.prototype.patchOutput = function patchOutput () {
    var token = heimdall.start("TypeScript:patchOutput");
    this.output.patch();
    heimdall.stop(token);
};
Compiler.prototype.resetCaches = function resetCaches () {
    this.resolver.reset();
    this.input.reset();
};

var DiagnosticsHandlerImpl = function DiagnosticsHandlerImpl(options) {
    this.write = ts.sys.write;
    this.throwOnError = options.throwOnError;
    this.host = createFormatDiagnosticsHost(options.workingPath);
};
DiagnosticsHandlerImpl.prototype.setWrite = function setWrite (write) {
    this.write = write;
};
DiagnosticsHandlerImpl.prototype.check = function check (diagnostics, throwOnError) {
    var normalized = normalize(diagnostics);
    if (normalized === undefined) {
        return false;
    }
    var message = this.format(normalized);
    if (this.throwOnError || throwOnError === true) {
        throw new Error(message);
    }
    this.write(message);
    return true;
};
DiagnosticsHandlerImpl.prototype.format = function format (diagnostics) {
    return ts.formatDiagnostics(diagnostics, this.host);
};
function normalize(diagnostics) {
    if (diagnostics === undefined) {
        return undefined;
    }
    if (Array.isArray(diagnostics)) {
        return diagnostics.length === 0 ? undefined : diagnostics;
    }
    return [diagnostics];
}
function createFormatDiagnosticsHost(rootPath) {
    var newLine = ts.sys.newLine;
    return {
        getCanonicalFileName: getCanonicalFileName,
        getCurrentDirectory: function () { return rootPath; },
        getNewLine: function () { return newLine; },
    };
}

function normalizeOptions(options) {
    var workingPath = toAbsolutePath(options.workingPath === undefined ? process.cwd() : options.workingPath);
    var rootPath = options.rootPath === undefined
        ? workingPath
        : toAbsolutePath(options.rootPath, workingPath);
    var projectPath = options.projectPath === undefined
        ? rootPath
        : toAbsolutePath(options.projectPath, workingPath);
    var buildPath = options.buildPath === undefined
        ? undefined
        : toAbsolutePath(options.buildPath, workingPath);
    var tsconfig = options.tsconfig;
    if (buildPath !== undefined &&
        !(rootPath === buildPath || isWithin(rootPath, buildPath))) {
        throw new Error(("buildPath \"" + buildPath + "\" must be at or within rootPath \"" + rootPath + "\""));
    }
    var configFileName;
    var rawConfig;
    if (typeof tsconfig === "object") {
        configFileName = undefined;
        rawConfig = tsconfig;
    }
    else if (tsconfig) {
        configFileName = normalizePath(tsconfig);
        rawConfig = undefined;
    }
    var throwOnError = options.throwOnError;
    if (throwOnError === undefined) {
        throwOnError = process.env.NODE_ENV === "production";
    }
    return {
        buildPath: buildPath,
        compilerOptions: options.compilerOptions,
        configFileName: configFileName,
        projectPath: projectPath,
        rawConfig: rawConfig,
        rootPath: rootPath,
        throwOnError: throwOnError,
        workingPath: workingPath,
    };
}

/**
 * Returns a Broccoli plugin instance that compiles
 * the files in the tsconfig.
 *
 * It is rooted to the inputNode's outputPath, all
 * files it imports must be resolvable from its input
 * except for the default library file.
 *
 * Errors are logged and it will try to emit whatever
 * it could successfully compile.
 *
 * It will only emit based on the root source files
 * you give it, by default it will look for all .ts
 * files, but if you specify a files or filesGlob
 * it will these as entry points and only compile
 * the files and files they reference from the input.
 */
function typescript(inputNode, options) {
    return new TypescriptCompiler(inputNode, options);
}
/**
 * TypeScript Broccoli plugin class.
 */
var TypescriptCompiler = (function (BroccoliPlugin$$1) {
    function TypescriptCompiler(inputNode, options) {
        BroccoliPlugin$$1.call(this, [inputNode], {
            annotation: options && options.annotation,
            name: "broccoli-typescript-compiler",
            persistentOutput: true,
        });
        var normalizedOptions = normalizeOptions(options || {});
        this.options = normalizedOptions;
        this.diagnosticHandler = new DiagnosticsHandlerImpl(normalizedOptions);
    }

    if ( BroccoliPlugin$$1 ) TypescriptCompiler.__proto__ = BroccoliPlugin$$1;
    TypescriptCompiler.prototype = Object.create( BroccoliPlugin$$1 && BroccoliPlugin$$1.prototype );
    TypescriptCompiler.prototype.constructor = TypescriptCompiler;
    TypescriptCompiler.prototype.build = function build () {
        var token = heimdall.start("TypeScript:compile");
        var compiler = this.compiler;
        if (!compiler) {
            compiler = this.compiler = new Compiler(toAbsolutePath(this.inputPaths[0]), toAbsolutePath(this.outputPath), this.options, this.diagnosticHandler);
        }
        compiler.compile();
        heimdall.stop(token);
    };
    TypescriptCompiler.prototype.setDiagnosticWriter = function setDiagnosticWriter (write) {
        this.diagnosticHandler.setWrite(write);
    };

    return TypescriptCompiler;
}(BroccoliPlugin));

var Funnel = require("broccoli-funnel");
var MergeTrees = require("broccoli-merge-trees");
/**
 * Backwards compat filter behavior.
 *
 * Preserves the filter aspect of compiling only .ts
 * and passing through all other files.
 */
function filterLike(inputNode, options) {
    var passthrough = new Funnel(inputNode, {
        annotation: "TypeScript passthrough",
        exclude: ["**/*.ts"],
    });
    var filter = new Funnel(inputNode, {
        annotation: "TypeScript input",
        include: ["**/*.ts"],
    });
    return new MergeTrees([passthrough, new TypescriptCompiler(filter, options)], {
        annotation: "TypeScript passthrough + output",
        overwrite: true,
    });
}

exports.default = typescript;
exports.TypescriptCompiler = TypescriptCompiler;
exports.filterTypescript = filterLike;
exports.ConfigParser = ConfigParser;
exports.InputIO = Input;
exports.PathResolver = PathResolverImpl;
exports.normalizePath = normalizePath;
exports.relativePathWithin = relativePathWithin;
exports.toAbsolutePath = toAbsolutePath;
exports.toCanonicalPath = toCanonicalPath;
//# sourceMappingURL=index.cjs.js.map
