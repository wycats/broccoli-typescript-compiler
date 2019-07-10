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
const fs = require("fs");
const testCasesDir = broccoli_test_helper_1.createReadableDir("tests/cases");
const testCases = fs.readdirSync(testCasesDir.path());
const expectationsDir = broccoli_test_helper_1.createReadableDir("tests/expectations");
// tslint:disable-next-line:only-arrow-functions
QUnit.module("plugin-cases", function () {
    testCases.forEach(testCase => {
        QUnit.test(testCase.replace("-", " "), (assert) => __awaiter(this, void 0, void 0, function* () {
            const tree = testCasesDir.read(testCase);
            delete tree["tsconfig.json"];
            const input = yield broccoli_test_helper_1.createTempDir();
            input.write(tree);
            const output = broccoli_test_helper_1.createBuilder(broccoli_typescript_compiler_1.default(input.path(), {
                compilerOptions: {
                    noEmitOnError: true,
                },
                rootPath: testCasesDir.path(testCase),
            }));
            yield output.build();
            assert.deepEqual(output.read(), expectationsDir.read(testCase));
        }));
    });
});
//# sourceMappingURL=cases-test.js.map