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
QUnit.module("plugin-rebuild", function () {
    QUnit.test("compiles basic typescript", (assert) => __awaiter(this, void 0, void 0, function* () {
        const input = yield broccoli_test_helper_1.createTempDir();
        try {
            input.write({
                "a.ts": `export default class A {}`,
                "index.ts": `export { default as A } from "./a";`,
            });
            const plugin = broccoli_typescript_compiler_1.default(input.path(), {
                tsconfig: {
                    compilerOptions: {
                        module: "commonjs",
                        moduleResolution: "node",
                        newLine: "LF",
                        target: "es2015",
                    },
                    files: ["index.ts"],
                },
            });
            const output = broccoli_test_helper_1.createBuilder(plugin);
            try {
                yield output.build();
                assert.deepEqual(output.changes(), {
                    "a.js": "create",
                    "index.js": "create",
                });
                assert.deepEqual(output.read(), {
                    "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
                    "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`,
                });
                input.write({
                    "b.ts": `export default class B {}`,
                    "index.ts": `export { default as A } from "./a";
export { default as B } from "./b"`,
                });
                yield output.build();
                assert.deepEqual(output.changes(), {
                    "b.js": "create",
                    "index.js": "change",
                });
                assert.deepEqual(output.read(), {
                    "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
                    "b.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class B {
}
exports.default = B;
`,
                    "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
var b_1 = require("./b");
exports.B = b_1.default;
`,
                });
                yield output.build();
                assert.deepEqual(output.changes(), {});
                input.write({
                    "b.ts": null,
                    "index.ts": `export { default as A } from "./a";`,
                });
                yield output.build();
                assert.deepEqual(output.changes(), {
                    "b.js": "unlink",
                    "index.js": "change",
                });
                assert.deepEqual(output.read(), {
                    "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
                    "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`,
                });
            }
            finally {
                yield output.dispose();
            }
        }
        finally {
            yield input.dispose();
        }
    }));
    QUnit.test("handles missing files", (assert) => __awaiter(this, void 0, void 0, function* () {
        const input = yield broccoli_test_helper_1.createTempDir();
        try {
            input.write({
                "index.ts": `export { default as A } from "./a";`,
            });
            const plugin = broccoli_typescript_compiler_1.default(input.path(), {
                tsconfig: {
                    compilerOptions: {
                        module: "commonjs",
                        moduleResolution: "node",
                        newLine: "LF",
                        target: "es2015",
                    },
                    files: ["index.ts"],
                },
            });
            let error = "";
            plugin.setDiagnosticWriter(msg => (error += msg));
            const output = broccoli_test_helper_1.createBuilder(plugin);
            try {
                yield output.build();
                assert.deepEqual(output.read(), {
                    "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`,
                });
                assert.equal(error.trim(), "index.ts(1,30): error TS2307: Cannot find module './a'.");
            }
            finally {
                yield output.dispose();
            }
        }
        finally {
            yield input.dispose();
        }
    }));
});
//# sourceMappingURL=plugin-test.js.map