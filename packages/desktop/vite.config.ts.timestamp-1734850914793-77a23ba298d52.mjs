// packages/desktop/vite.config.ts
import path from "node:path";
import react from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/@vitejs+plugin-react@4.3.4_vite@6.0.1_@types+node@22.10.1_jiti@1.21.6_yaml@2.6.1_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/vite@6.0.1_@types+node@22.10.1_jiti@1.21.6_yaml@2.6.1/node_modules/vite/dist/node/index.js";
import { visualizer } from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@4.27.4/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import jotaiDebugLabel from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/jotai@2.10.3_@types+react@18.3.12_react@18.3.1/node_modules/jotai/esm/babel/plugin-debug-label.mjs";
import jotaiReactRefresh from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/jotai@2.10.3_@types+react@18.3.12_react@18.3.1/node_modules/jotai/esm/babel/plugin-react-refresh.mjs";
import { NodeGlobalsPolyfillPlugin } from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/@esbuild-plugins+node-globals-polyfill@0.2.3_esbuild@0.24.0/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import { NodeModulesPolyfillPlugin } from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/@esbuild-plugins+node-modules-polyfill@0.2.2_esbuild@0.24.0/node_modules/@esbuild-plugins/node-modules-polyfill/dist/index.js";
var __vite_injected_original_dirname = "/Users/ikechan/dev/scenario-flow/packages/desktop";
var host = process.env.TAURI_DEV_HOST;
var vite_config_default = defineConfig(({ mode }) => ({
  resolve: {
    alias: [{ find: "@/", replacement: path.join(__vite_injected_original_dirname, "../core/src/") }]
  },
  plugins: [
    react({
      babel: {
        plugins: [jotaiReactRefresh, jotaiDebugLabel],
        presets: ["jotai/babel/preset"]
      }
    }),
    mode === "analyze" && visualizer({
      open: true,
      filename: "analyze/stats.html"
    }),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true
    }),
    NodeModulesPolyfillPlugin()
  ],
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host !== "" ? host : false,
    hmr: host !== "" ? {
      protocol: "ws",
      host,
      port: 1421
    } : void 0,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"]
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZXMvZGVza3RvcC92aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9pa2VjaGFuL2Rldi9zY2VuYXJpby1mbG93L3BhY2thZ2VzL2Rlc2t0b3BcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9pa2VjaGFuL2Rldi9zY2VuYXJpby1mbG93L3BhY2thZ2VzL2Rlc2t0b3Avdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2lrZWNoYW4vZGV2L3NjZW5hcmlvLWZsb3cvcGFja2FnZXMvZGVza3RvcC92aXRlLmNvbmZpZy50c1wiOy8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZXN0XCIgLz5cblxuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiXG5cbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIlxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIlxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIlxuaW1wb3J0IGpvdGFpRGVidWdMYWJlbCBmcm9tIFwiam90YWkvYmFiZWwvcGx1Z2luLWRlYnVnLWxhYmVsXCJcbmltcG9ydCBqb3RhaVJlYWN0UmVmcmVzaCBmcm9tIFwiam90YWkvYmFiZWwvcGx1Z2luLXJlYWN0LXJlZnJlc2hcIlxuaW1wb3J0IHsgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbiB9IGZyb20gXCJAZXNidWlsZC1wbHVnaW5zL25vZGUtZ2xvYmFscy1wb2x5ZmlsbFwiXG5pbXBvcnQgeyBOb2RlTW9kdWxlc1BvbHlmaWxsUGx1Z2luIH0gZnJvbSBcIkBlc2J1aWxkLXBsdWdpbnMvbm9kZS1tb2R1bGVzLXBvbHlmaWxsXCJcblxuLy8gQHRzLWV4cGVjdC1lcnJvciBwcm9jZXNzIGlzIGEgbm9kZWpzIGdsb2JhbFxuY29uc3QgaG9zdDogc3RyaW5nID0gcHJvY2Vzcy5lbnYuVEFVUklfREVWX0hPU1RcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiBbeyBmaW5kOiBcIkAvXCIsIHJlcGxhY2VtZW50OiBwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uL2NvcmUvc3JjL1wiKSB9XSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KHtcbiAgICAgIGJhYmVsOiB7XG4gICAgICAgIHBsdWdpbnM6IFtqb3RhaVJlYWN0UmVmcmVzaCwgam90YWlEZWJ1Z0xhYmVsXSxcbiAgICAgICAgcHJlc2V0czogW1wiam90YWkvYmFiZWwvcHJlc2V0XCJdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBtb2RlID09PSBcImFuYWx5emVcIiAmJlxuICAgICAgdmlzdWFsaXplcih7XG4gICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgIGZpbGVuYW1lOiBcImFuYWx5emUvc3RhdHMuaHRtbFwiLFxuICAgICAgfSksXG4gICAgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbih7XG4gICAgICBwcm9jZXNzOiB0cnVlLFxuICAgICAgYnVmZmVyOiB0cnVlLFxuICAgIH0pLFxuICAgIE5vZGVNb2R1bGVzUG9seWZpbGxQbHVnaW4oKSxcbiAgXSxcblxuICAvLyAxLiBwcmV2ZW50IHZpdGUgZnJvbSBvYnNjdXJpbmcgcnVzdCBlcnJvcnNcbiAgY2xlYXJTY3JlZW46IGZhbHNlLFxuICAvLyAyLiB0YXVyaSBleHBlY3RzIGEgZml4ZWQgcG9ydCwgZmFpbCBpZiB0aGF0IHBvcnQgaXMgbm90IGF2YWlsYWJsZVxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAxNDIwLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgaG9zdDogaG9zdCAhPT0gXCJcIiA/IGhvc3QgOiBmYWxzZSxcbiAgICBobXI6XG4gICAgICBob3N0ICE9PSBcIlwiXG4gICAgICAgID8ge1xuICAgICAgICAgICAgcHJvdG9jb2w6IFwid3NcIixcbiAgICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgICBwb3J0OiAxNDIxLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgd2F0Y2g6IHtcbiAgICAgIC8vIDMuIHRlbGwgdml0ZSB0byBpZ25vcmUgd2F0Y2hpbmcgYHNyYy10YXVyaWBcbiAgICAgIGlnbm9yZWQ6IFtcIioqL3NyYy10YXVyaS8qKlwiXSxcbiAgICB9LFxuICB9LFxufSkpXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsT0FBTyxVQUFVO0FBRWpCLE9BQU8sV0FBVztBQUNsQixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGtCQUFrQjtBQUMzQixPQUFPLHFCQUFxQjtBQUM1QixPQUFPLHVCQUF1QjtBQUM5QixTQUFTLGlDQUFpQztBQUMxQyxTQUFTLGlDQUFpQztBQVYxQyxJQUFNLG1DQUFtQztBQWF6QyxJQUFNLE9BQWUsUUFBUSxJQUFJO0FBRWpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsU0FBUztBQUFBLElBQ1AsT0FBTyxDQUFDLEVBQUUsTUFBTSxNQUFNLGFBQWEsS0FBSyxLQUFLLGtDQUFXLGNBQWMsRUFBRSxDQUFDO0FBQUEsRUFDM0U7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLE9BQU87QUFBQSxRQUNMLFNBQVMsQ0FBQyxtQkFBbUIsZUFBZTtBQUFBLFFBQzVDLFNBQVMsQ0FBQyxvQkFBb0I7QUFBQSxNQUNoQztBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsU0FBUyxhQUNQLFdBQVc7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxJQUNaLENBQUM7QUFBQSxJQUNILDBCQUEwQjtBQUFBLE1BQ3hCLFNBQVM7QUFBQSxNQUNULFFBQVE7QUFBQSxJQUNWLENBQUM7QUFBQSxJQUNELDBCQUEwQjtBQUFBLEVBQzVCO0FBQUE7QUFBQSxFQUdBLGFBQWE7QUFBQTtBQUFBLEVBRWIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTSxTQUFTLEtBQUssT0FBTztBQUFBLElBQzNCLEtBQ0UsU0FBUyxLQUNMO0FBQUEsTUFDRSxVQUFVO0FBQUEsTUFDVjtBQUFBLE1BQ0EsTUFBTTtBQUFBLElBQ1IsSUFDQTtBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsTUFFTCxTQUFTLENBQUMsaUJBQWlCO0FBQUEsSUFDN0I7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
