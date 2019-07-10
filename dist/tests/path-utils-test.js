"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_typescript_compiler_1 = require("broccoli-typescript-compiler");
QUnit.module("path-utils", () => {
    QUnit.test("relativePathWithin", assert => {
        const a = broccoli_typescript_compiler_1.toAbsolutePath("a");
        const b = broccoli_typescript_compiler_1.toAbsolutePath("a/b");
        assert.strictEqual(broccoli_typescript_compiler_1.relativePathWithin(a, b), "b");
        assert.strictEqual(broccoli_typescript_compiler_1.relativePathWithin(b, a), undefined);
    });
});
//# sourceMappingURL=path-utils-test.js.map