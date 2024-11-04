import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./packages/desktop/vite.config.ts",
  "./packages/web/vite.config.ts",
  "./packages/core/vite.config.ts"
])
