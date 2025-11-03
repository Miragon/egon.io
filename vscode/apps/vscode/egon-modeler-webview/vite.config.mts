/// <reference types='vitest' />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(({ mode }) => ({
    root: __dirname,
    cacheDir: "../../../node_modules/.vite/apps/vscode/egon-modeler-webview",
    server: {
        port: 4200,
        host: "localhost",
    },
    preview: {
        port: 4300,
        host: "localhost",
    },

    plugins: [tsconfigPaths()],

    resolve: {
        alias:
            mode === "development"
                ? {
                      "@egon/diagram-js-egon-plugin": path.resolve(
                          __dirname,
                          "../../../dist/libs/diagram-js-egon-plugin"
                      ),
                      "@egon/vscode-domain-story": path.resolve(
                          __dirname,
                          "../../../dist/libs/vscode/domain-story"
                      ),
                      "@egon/vscode-data-transfer-objects": path.resolve(
                          __dirname,
                          "../../../dist/libs/vscode/data-transfer-objects"
                      ),
                  }
                : {},
    },

    esbuild: {
        minifyIdentifiers: false,
        keepNames: true,
    },

    build: {
        outDir: path.resolve(__dirname, "../../../dist/apps/vscode/egon-io/webview"),
        emptyOutDir: false,
        assetsInlineLimit: 20_000,
        reportCompressedSize: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                entryFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        },
    },
}));
