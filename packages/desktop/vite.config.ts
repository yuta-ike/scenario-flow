/// <reference types="vitest" />

import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import jotaiDebugLabel from "jotai/babel/plugin-debug-label"
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh"
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill"

import type { PluginOption } from "vite"

// @ts-expect-error process is a nodejs global
const host: string = process.env.TAURI_DEV_HOST

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
    }) as PluginOption[],
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

  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host !== "" ? host : false,
    hmr:
      host !== ""
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}))
