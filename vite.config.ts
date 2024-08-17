/// <reference types="vitest" />

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: [
          "jotai/babel/plugin-react-refresh",
          "jotai/babel/plugin-debug-label",
        ],
         presets: ['jotai/babel/preset'],
      },
    }),
    mode === "analyze" &&
      visualizer({
        open: true,
        filename: "analyze/stats.html",
      }),
  ],
  test: {
    globals: true,
  },
}))
