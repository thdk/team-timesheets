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
}