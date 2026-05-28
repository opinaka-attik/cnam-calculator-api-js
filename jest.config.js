/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**/*.js"],
    coverageThreshold: {
        global: {
            lines:      80,
            functions:  80,
            branches:   80,
            statements: 80,
        },
    },
    coverageReporters: ["text", "lcov", "html"],
    verbose: true,
};
