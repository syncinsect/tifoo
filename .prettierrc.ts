import type { Config } from "prettier";

/**
 * @type {import('prettier').Options}
 */
const config: Config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  bracketSameLine: true,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "<BUILTIN_MODULES>", // Node.js built-in modules
    "<THIRD_PARTY_MODULES>", // Imports not matched by other special words or groups.
    "", // Empty line
    "^@plasmo/(.*)$",
    "",
    "^@plasmohq/(.*)$",
    "",
    "^~(.*)$",
    "",
    "^[./]",
  ],
  endOfLine: "lf",
  embeddedLanguageFormatting: "auto",
  quoteProps: "as-needed",
  proseWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
};

export default config;
