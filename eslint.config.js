const globals = {
  console: "readonly",
  document: "readonly",
  fetch: "readonly",
  FormData: "readonly",
  Math: "readonly",
  process: "readonly",
  URL: "readonly",
};

module.exports = [
  {
    files: ["app.js", "server.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
    },
  },
];
