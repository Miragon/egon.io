import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
    {
        ignores: ["**/dist", "**/node_modules", "**/coverage"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"],
        rules: {
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "warn",
        },
    },
    {
        files: ["**/*.js", "**/*.cjs"],
        languageOptions: {
            globals: {
                require: "readonly",
                module: "readonly",
                __dirname: "readonly",
                Buffer: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
];
