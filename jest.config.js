/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    testTimeout: 10000,
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**/*.js"],
    coverageThreshold: {
        global: {
            lines:      90,
            functions:  80,
            branches:   90,
            statements: 90,
        },
    },
    coverageReporters: ["text", "lcov", "html"],
    verbose: true,
};
