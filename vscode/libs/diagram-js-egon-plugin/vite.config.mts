/// <reference types='vitest' />
import { defineConfig } from "vite";
import * as path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

export default defineConfig({
    root: __dirname,
    cacheDir: "../../node_modules/.vite/libs/diagram-js-egon-plugin",
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    plugins: [
        tsconfigPaths(),
        dts({
            outDir: "../../dist/libs/diagram-js-egon-plugin",
            entryRoot: "src",
            include: ["src/**/*.ts", "src/**/*.tsx", "src/types/**/*.d.ts"],
            tsconfigPath: "./tsconfig.lib.json",
            copyDtsFiles: true,
        }),
    ],
    build: {
        outDir: "../../dist/libs/diagram-js-egon-plugin",
        reportCompressedSize: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        lib: {
            entry: "src/index.ts",
            name: "diagram-js-egon-plugin",
            fileName: "index",
            formats: ["es"],
        },
        rollupOptions: {
            external: ["diagram-js", "diagram-js-direct-editing", "diagram-js-minimap", "ids", "min-dash", "min-dom", "rxjs", "tiny-svg"],
            input: {
                index: path.resolve(__dirname, "src/index.ts"),
                style: path.resolve(__dirname, "src/styles.scss"),
            },
            output: {
                entryFileNames: `[name].js`,
                assetFileNames: "[name].[ext]",
            },
        },
    },
});
