module.exports = {
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    roots: ["<rootDir>/src"],
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "((\\.|/)(test|spec))\\.tsx?$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "scss", "css"],
    moduleNameMapper: {
        "\\.(css|less|scss)$": "<rootDir>/src/__mocks__/style-mock.js"
    },
    testEnvironment: "<rootDir>/src/__test-utils__/custom-jest-environment.js",
    setupFiles: ['<rootDir>/src/__test-utils__/setup.js'],
    globals: {
        'ts-jest': {
            isolatedModules: true
        }
    },
}