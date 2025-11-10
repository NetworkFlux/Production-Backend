// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  //
  // 1️⃣ Global ignores — files & folders ESLint should skip entirely
  //
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "**/*.config.js",
      "**/*.config.cjs",
      "**/*.config.mjs",
      "**/jest.config.*",
      "**/eslint.config.*",
      "**/vite.config.*",
    ],
  },

  //
  // 2️⃣ Base recommended configs
  //
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,

  //
  // 3️⃣ Global rules — consistent behavior across your project
  //
  {
    rules: {
      //
      // ✅ General best practices
      //
      eqeqeq: ["error", "always"], // enforce === instead of ==
      "no-var": "error",
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",

      // Use the TS version of no-unused-vars
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      //
      // ✅ TypeScript-specific correctness
      //
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { allowExpressions: true },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],

      //
      // 🚑 TEMP FIX for TS 8.4x + ESLint 9 bug
      //
      "@typescript-eslint/unified-signatures": "off",

      //
      // ✅ Stylistic and clarity rules
      //
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        { "ts-expect-error": "allow-with-description" },
      ],
      "arrow-spacing": ["error", { before: true, after: true }],
      "space-before-blocks": ["error", "always"],
      "keyword-spacing": ["error", { before: true, after: true }],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2, { SwitchCase: 1 }],
    },
  },

  //
  // 4️⃣ Source files — your actual application code
  //
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
  },

  //
  // 5️⃣ Test files — more relaxed for test setups
  //
  {
    files: ["test/**/*.{ts,tsx,js,jsx}", "**/__tests__/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "no-console": "off",
    },
  }
);
