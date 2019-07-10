"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_test_helper_1 = require("broccoli-test-helper");
const broccoli_typescript_compiler_1 = require("broccoli-typescript-compiler");
const ts = require("typescript");
let root;
let input;
/* tslint:disable:object-literal-sort-keys */
/* tslint:disable:object-literal-key-quotes */
QUnit.module("config-parser", {
    beforeEach() {
        return __awaiter(this, void 0, void 0, function* () {
            [root, input] = yield Promise.all([broccoli_test_helper_1.createTempDir(), broccoli_test_helper_1.createTempDir()]);
        });
    },
    afterEach() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([root.dispose(), input.dispose()]);
        });
    },
}, () => {
    QUnit.module("extended config", {
        beforeEach() {
            return __awaiter(this, void 0, void 0, function* () {
                root.write({
                    "tsconfig.json": `{
          "compilerOptions": {
            "moduleResolution": "node",
            "outDir": "dist",
            "types": ["foo"],
            "typeRoots": [
              "typings"
            ]
          }
        }`,
                    lib: {
                        "tsconfig.json": `{
            "extends": "../tsconfig.json",
            "compilerOptions": {
              "strictNullChecks": true
            }
          }`,
                        "b.ts": "export class B {};",
                    },
                    typings: {
                        foo: {
                            "index.d.ts": "export default class Foo {};",
                        },
                    },
                });
                input.write({
                    lib: {
                        "a.ts": "export class A {};",
                    },
                });
            });
        },
    }, () => {
        QUnit.test("should be able to find the extended config", assert => {
            const rootPath = broccoli_typescript_compiler_1.toAbsolutePath(root.path());
            const inputPath = broccoli_typescript_compiler_1.toAbsolutePath(input.path());
            const parser = new broccoli_typescript_compiler_1.ConfigParser(rootPath, undefined, "lib/tsconfig.json", { module: "umd" }, rootPath, new broccoli_typescript_compiler_1.InputIO(new broccoli_typescript_compiler_1.PathResolver(rootPath, inputPath)));
            const parsed = parser.parseConfig();
            assert.deepEqual(parsed.errors, []);
            assert.deepEqual(parsed.options, {
                configFilePath: broccoli_typescript_compiler_1.toAbsolutePath("lib/tsconfig.json", rootPath),
                module: ts.ModuleKind.UMD,
                moduleResolution: ts.ModuleResolutionKind.NodeJs,
                outDir: broccoli_typescript_compiler_1.toAbsolutePath("dist", rootPath),
                strictNullChecks: true,
                typeRoots: [broccoli_typescript_compiler_1.toAbsolutePath("typings", rootPath)],
                types: ["foo"],
            });
            assert.deepEqual(parsed.fileNames, [
                broccoli_typescript_compiler_1.toAbsolutePath("lib/a.ts", rootPath),
            ]);
        });
    });
});
//# sourceMappingURL=config-parser-test.js.map