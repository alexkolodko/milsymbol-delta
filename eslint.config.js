// eslint.config.js
export default [
  {
    ignores: ["src/delta/delta-sidc-icon-data.js"],
  },
  {
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      prettier: {
        "prettier/prettier": "error",
        //"linebreak-style": ["error", "windows"],
        "no-console": ["error", { allow: ["info", "warn", "error"] }],
        "no-unused-vars": ["error", { vars: "all", args: "none" }],
        semi: ["error", "always"],
      },
    },
  },
];

/*
module.exports = {
  //extends: "eslint:recommended",
  //env: {
  //  browser: true
  //commonjs: true
  //},
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    //"linebreak-style": ["error", "windows"],
    "no-console": ["error", { allow: ["info", "warn", "error"] }],
    "no-unused-vars": ["error", { vars: "all", args: "none" }],
    semi: ["error", "always"]
  }
};
*/
