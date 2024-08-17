import js from "@eslint/js"
import importPlugin from "eslint-plugin-import"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import unusedImportsPlugin from "eslint-plugin-unused-imports"
import prettierConfig from "eslint-config-prettier"
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat()

export default tseslint.config(
  { ignores: ["dist", "analyze", "coverage", ".*"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...compat.config(reactHooksPlugin.configs.recommended),
      ...compat.config(jsxA11yPlugin.configs.recommended),
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.app.json"],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/button-has-type": "warn",
      "react/checked-requires-onchange-or-readonly": "warn",
      "react/jsx-key": "warn",
      "react/jsx-filename-extension": [
        "error",
        { extensions: [".jsx", ".tsx"] },
      ],
      "react/jsx-no-leaked-render": "error",
      "react/jsx-no-target-blank": "warn",
      "react/jsx-no-useless-fragment": "warn",
      "react/self-closing-comp": "warn",
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
    },
  },
  {
    name: "import",
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
  {
    name: "unused-import",
    plugins: {
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      "unused-imports/no-unused-imports": "warn",
    },
  },
  {
    name: "prettier",
    rules: {
      ...prettierConfig.rules,
    },
  },
)
