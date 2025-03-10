import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ command }) => {
    let root = "";
    if (command === "build") {
        root = "src/webview";
    }
    return {
        resolve: {
            alias: [
                {
                    find: "@",
                    replacement: path.resolve(__dirname, "./app"),
                },
            ],
        },
        plugins: [],
        build: {
            target: "es2021",
            commonjsOptions: {
                transformMixedEsModules: true,
            },
            outDir: "dist/client",
            rollupOptions: {
                input: `${root}/app/index.ts`,
                output: {
                    // don't hash the name of the output file (index.js)
                    entryFileNames: `[name].js`,
                    assetFileNames: `[name].[ext]`,
                },
            },
        },
        define: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
    };
});
