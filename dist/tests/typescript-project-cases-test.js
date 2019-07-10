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
const typescript_project_runner_1 = require("./typescript-project-runner");
const broccoli_typescript_compiler_1 = require("broccoli-typescript-compiler");
// tslint:disable:no-console
const runner = new typescript_project_runner_1.default({
    typescriptDir: "vendor/typescript",
});
// tslint:disable:only-arrow-functions
QUnit.module("typescript-project-cases", function () {
    runner.each(project => {
        QUnit.module(project.basename, function () {
            project.each(mod => {
                QUnit.test(mod.module, function (assert) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const input = yield broccoli_test_helper_1.createTempDir();
                        try {
                            input.copy(project.dir);
                            const plugin = broccoli_typescript_compiler_1.default(input.path(), mod.pluginConfig);
                            let errors;
                            plugin.setDiagnosticWriter(msg => {
                                if (errors === undefined) {
                                    errors = "";
                                }
                                errors += msg;
                            });
                            const output = broccoli_test_helper_1.createBuilder(plugin);
                            try {
                                yield output.build();
                                const actual = output.read();
                                const baseline = mod.baseline;
                                assert.deepEqual(actual, baseline.output);
                                errors = removeRoots(errors, project.dir);
                                assert.equal(errors, baseline.errors);
                            }
                            finally {
                                yield output.dispose();
                            }
                        }
                        finally {
                            yield input.dispose();
                        }
                    });
                });
            });
        });
    });
});
function removeRoots(errors, rootPath) {
    if (errors === undefined) {
        return;
    }
    const root = broccoli_typescript_compiler_1.toAbsolutePath(rootPath);
    const pattern = new RegExp(escapeRegExp(root + "/"), "g");
    return errors.replace(pattern, "").toLowerCase();
}
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//# sourceMappingURL=typescript-project-cases-test.js.map