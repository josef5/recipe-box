import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // <dialog> has an implicit ARIA role of "dialog" (an interactive widget),
      // but jsx-a11y doesn't recognise it as interactive. Explicitly allow the
      // handlers needed for backdrop-click-to-close and focus-trap.
      "jsx-a11y/no-noninteractive-element-interactions": [
        "error",
        {
          dialog: ["onClick", "onKeyDown", "onKeyUp", "onKeyPress", "onToggle"],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
