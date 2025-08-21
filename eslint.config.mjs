import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // allow any
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "off"
        {
          argsIgnorePattern: "^_",   // ignore unused function args starting with _
          varsIgnorePattern: "^_",   // ignore unused variables starting with _
        },
      ],
    },
  },
];

export default eslintConfig;
