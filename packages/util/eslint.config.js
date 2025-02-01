import defaultConfig from "@scenario-flow/eslint-config/react.js"

const config = {
  ...defaultConfig,
  languageOptions: {
    ...defaultConfig.languageOptions,
    parserOptions: {
      project: ["./tsconfig.app.json"],
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
}

export default config
