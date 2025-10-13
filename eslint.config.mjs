// @ts-check
import antfu from "@antfu/eslint-config";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  antfu(
    {
      vue: true,
      typescript: true,
      formatters: true,
      stylistic: {
        indent: 2,
        quotes: "double",
        semi: true,
      },
    },
    {
      plugins: {
        "better-tailwindcss": eslintPluginBetterTailwindcss,
      },
      settings: {
        "better-tailwindcss": {
          entryPoint: "app/assets/css/main.css",
        },
      },
      rules: {
        "node/prefer-global/process": "off",
        "better-tailwindcss/enforce-consistent-class-order": "warn",
        "better-tailwindcss/no-duplicate-classes": "warn",
        "better-tailwindcss/no-unnecessary-whitespace": "warn",
      },
    },
  ),
);
