module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    "@typescript-eslint",
    "react-hooks",
    "react-refresh",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
    rules: {
    "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
    ],

    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
        "warn",
        {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        },
    ],
    },
  ignorePatterns: [
    "dist",
    "node_modules",
  ],
};