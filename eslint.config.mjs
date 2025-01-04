import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js recommended configurations
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Override specific ESLint rules
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable the rule globally
      "@typescript-eslint/no-empty-object-type": "off"
    },
  },
];

export default eslintConfig;
