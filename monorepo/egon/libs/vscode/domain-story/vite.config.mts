/// <reference types='vitest' />
import { defineConfig } from "vite";
import * as path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

export default defineConfig({
    root: __dirname,
    cacheDir: "../../../node_modules/.vite/libs/vscode/domain-story",
    plugins: [
        tsconfigPaths(),
        dts({
            outDir: "../../../dist/libs/vscode/domain-story",
            entryRoot: "src",
        }),
    ],
    build: {
        outDir: "../../../dist/libs/vscode/domain-story",
        reportCompressedSize: true,
        lib: {
            entry: "src/index.ts",
            name: "domain-story",
            fileName: "index",
            formats: ["es", "cjs"],
        },
        rollupOptions: {
            external: ["vscode", "tsyringe", "reflect-metadata"],
        },
    },
});
