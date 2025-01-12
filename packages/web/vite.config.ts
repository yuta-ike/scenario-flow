/// <reference types="vitest" />

import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import jotaiDebugLabel from "jotai/babel/plugin-debug-label"
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh"
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: [{ find: "@/", replacement: path.join(__dirname, "../core/src/") }],
  },
  plugins: [
    react({
      babel: {
        plugins: [jotaiReactRefresh, jotaiDebugLabel],
        presets: ["jotai/babel/preset"],
      },
    }),
    mode === "analyze" &&
      visualizer({
        open: true,
        filename: "analyze/stats.html",
      }),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
    }),
    NodeModulesPolyfillPlugin(),
  ],
  test: {},
}))
