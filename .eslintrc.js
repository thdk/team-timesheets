/* eslint-env node */

module.exports = {
    extends: [
        'eslint:recommended',
    ],
    root: true,    
    globals: {
        window: true,
        jest: true,
    },
    parserOptions: {
        "ecmaVersion": "latest"
    },

    env: {
        "es6": true
    },
    overrides: [
        {
            files: ["src/*.ts", "src/*.tsx"],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                "plugin:@typescript-eslint/recommended-requiring-type-checking",
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: ['./tsconfig.json'],
            },
            plugins: ['@typescript-eslint'],
            rules: {
                // These rules should be on eventually!
                "@typescript-eslint/no-non-null-assertion": "off",
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-empty-function": "off",
                "@typescript-eslint/no-misused-promises": "off",
                "@typescript-eslint/await-thenable": "off",
                "@typescript-eslint/no-floating-promises": "off",
                "@typescript-eslint/no-unsafe-argument": "off",
                "@typescript-eslint/no-unsafe-assignment": "off",
                "@typescript-eslint/no-unsafe-call": "off",
                "@typescript-eslint/no-unsafe-member-access": "off",
                "@typescript-eslint/no-unsafe-return": "off",
                "@typescript-eslint/require-await": "off",
                "@typescript-eslint/restrict-plus-operands": "off",
                "@typescript-eslint/restrict-template-expressions": "off",
                "@typescript-eslint/unbound-method": "off",
            },
        }
    ]
};
