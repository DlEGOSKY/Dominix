// Minimal ESLint flat config focused on a11y auditing.
// Goal: catch the same issues a screen reader would surface (missing labels,
// non-keyboard-accessible interactives, invalid ARIA, etc.) without needing
// NVDA or VoiceOver. We deliberately keep the rest of the rules light to
// avoid noise — this is an audit tool, not a style enforcer.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "public/**",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "18.3" },
    },
    plugins: {
      "jsx-a11y": jsxA11y,
      react,
    },
    rules: {
      // ---- A11y: full recommended set (this is the whole point of this config) ----
      ...jsxA11y.configs.recommended.rules,

      // ---- Keep TypeScript noise low so a11y warnings stay visible ----
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-empty": "off",
      "no-useless-escape": "off",
      "no-constant-condition": "off",
      "no-prototype-builtins": "off",
      "no-case-declarations": "off",
      "no-undef": "off", // TS handles this better
    },
  },
];
