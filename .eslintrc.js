module.exports = {
  root: true,
  plugins: ["react"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "react-app",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/react",
  ],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
};
