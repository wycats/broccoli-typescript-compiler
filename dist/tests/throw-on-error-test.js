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
// tslint:disable-next-line:only-arrow-functions
QUnit.module("throwOnError", function ({ beforeEach, afterEach }) {
    let input;
    let output;
    let nodeEnv;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        input = yield broccoli_test_helper_1.createTempDir();
        output = null;
        // By default, run each test in non-production environment. Saves the current
        // value of NODE_ENV and restores it after each test.
        nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        if (input) {
            yield input.dispose();
        }
        if (output) {
            yield output.dispose();
        }
        process.env.NODE_ENV = nodeEnv;
    }));
    QUnit.test("does not throw on type errors by default", (assert) => __awaiter(this, void 0, void 0, function* () {
        assert.expect(1);
        input.write({
            "index.ts": `let num: number = 'string';`,
        });
        const plugin = broccoli_typescript_compiler_1.default(input.path(), {
            tsconfig: {
                files: ["index.ts"],
            },
        });
        output = broccoli_test_helper_1.createBuilder(plugin);
        yield output.build();
        assert.ok(true, "build completed without failure");
    }));
    QUnit.test("throws on type errors when throwOnErrors is set to true", (assert) => __awaiter(this, void 0, void 0, function* () {
        assert.expect(1);
        input.write({
            "index.ts": `let num: number = 'string';`,
        });
        const plugin = broccoli_typescript_compiler_1.default(input.path(), {
            throwOnError: true,
            tsconfig: {
                files: ["index.ts"],
            },
        });
        output = broccoli_test_helper_1.createBuilder(plugin);
        try {
            yield output.build();
        }
        catch (e) {
            assertMatches(assert, e.message, /TS2322/);
        }
    }));
    QUnit.test("throws on type errors if NODE_ENV is 'production'", (assert) => __awaiter(this, void 0, void 0, function* () {
        assert.expect(1);
        input.write({
            "index.ts": `let num: number = 'string';`,
        });
        process.env.NODE_ENV = "production";
        const plugin = broccoli_typescript_compiler_1.default(input.path(), {
            tsconfig: {
                files: ["index.ts"],
            },
        });
        output = broccoli_test_helper_1.createBuilder(plugin);
        try {
            yield output.build();
        }
        catch (e) {
            assertMatches(assert, e.message, /TS2322/);
        }
    }));
    QUnit.test("does not throw by default if NODE_ENV is not 'production'", (assert) => __awaiter(this, void 0, void 0, function* () {
        assert.expect(1);
        input.write({
            "index.ts": `let num: number = 'string';`,
        });
        const plugin = broccoli_typescript_compiler_1.default(input.path(), {
            tsconfig: {
                files: ["index.ts"],
            },
        });
        output = broccoli_test_helper_1.createBuilder(plugin);
        yield output.build();
        assert.ok(true, "build completed without failure");
    }));
    QUnit.test("does not throw when NODE_ENV is 'production' if throwOnError is explicitly false", (assert) => __awaiter(this, void 0, void 0, function* () {
        assert.expect(1);
        input.write({
            "index.ts": `let num: number = 'string';`,
        });
        process.env.NODE_ENV = "production";
        const plugin = broccoli_typescript_compiler_1.default(input.path(), {
            throwOnError: false,
            tsconfig: {
                files: ["index.ts"],
            },
        });
        output = broccoli_test_helper_1.createBuilder(plugin);
        yield output.build();
        assert.ok(true, "build completed without failure");
    }));
});
function assertMatches(assert, str, regex) {
    const match = str.match(regex);
    assert.pushResult({
        actual: str,
        expected: regex.toString(),
        message: `Expected string to match regular expression`,
        result: !!match,
    });
}
//# sourceMappingURL=throw-on-error-test.js.map