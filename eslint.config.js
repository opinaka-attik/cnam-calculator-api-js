const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                require: "readonly",
                module: "readonly",
                exports: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                console: "readonly",
                Buffer: "readonly",
            },
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "eqeqeq": ["error", "always"],
            "no-var": "error",
            "prefer-const": "error",
        },
    },
    {
        // Fichiers de tests : globals Jest
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: {
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
            },
        },
    },
];
