// @ts-check

import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import { FlatCompat } from "@eslint/eslintrc"
import base from "./base.js"

const compat = new FlatCompat()

export default tseslint.config(
  { ignores: ["dist", "analyze", "coverage", ".*"] },
  ...base,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // @ts-expect-error
      ...compat.config(reactHooksPlugin.configs.recommended),
      ...compat.config(jsxA11yPlugin.configs.recommended),
    ],
    plugins: {
      // @ts-expect-error
      react: reactPlugin,
      // @ts-expect-error
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11yPlugin,
    },
    // @ts-expect-error
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
      "react/jsx-no-target-blank": "warn",
      "react/jsx-no-useless-fragment": "warn",
      "react/self-closing-comp": "warn",
    }
  }
)
