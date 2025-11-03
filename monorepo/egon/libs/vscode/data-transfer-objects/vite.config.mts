/// <reference types='vitest' />
import { defineConfig } from "vite";
import * as path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

export default defineConfig({
    root: __dirname,
    cacheDir: "../../../node_modules/.vite/libs/vscode/data-transfer-objects",
    plugins: [
        tsconfigPaths(),
        dts({
            outDir: "../../../dist/libs/vscode/data-transfer-objects",
            entryRoot: "src",
        }),
    ],
    build: {
        outDir: "../../../dist/libs/vscode/data-transfer-objects",
        reportCompressedSize: true,
        lib: {
            entry: "src/index.ts",
            name: "data-transfer-objects",
            fileName: "index",
            formats: ["es", "cjs"],
        },
    },
});
