// packages/core/vite.config.ts
import react from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/@vitejs+plugin-react@4.3.4_vite@6.0.1_@types+node@22.10.1_jiti@1.21.6_yaml@2.6.1_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/vite@6.0.1_@types+node@22.10.1_jiti@1.21.6_yaml@2.6.1/node_modules/vite/dist/node/index.js";
import { visualizer } from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@4.27.4/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import jotaiDebugLabel from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/jotai@2.10.3_@types+react@18.3.12_react@18.3.1/node_modules/jotai/esm/babel/plugin-debug-label.mjs";
import jotaiReactRefresh from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/jotai@2.10.3_@types+react@18.3.12_react@18.3.1/node_modules/jotai/esm/babel/plugin-react-refresh.mjs";
import { NodeGlobalsPolyfillPlugin } from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/@esbuild-plugins+node-globals-polyfill@0.2.3_esbuild@0.24.0/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import { NodeModulesPolyfillPlugin } from "file:///Users/ikechan/dev/scenario-flow/node_modules/.pnpm/@esbuild-plugins+node-modules-polyfill@0.2.2_esbuild@0.24.0/node_modules/@esbuild-plugins/node-modules-polyfill/dist/index.js";
var vite_config_default = defineConfig(({ mode }) => ({
  resolve: {
    alias: [{ find: "@/", replacement: `./src/` }]
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
  test: {
    globals: true
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZXMvY29yZS92aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9pa2VjaGFuL2Rldi9zY2VuYXJpby1mbG93L3BhY2thZ2VzL2NvcmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9pa2VjaGFuL2Rldi9zY2VuYXJpby1mbG93L3BhY2thZ2VzL2NvcmUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2lrZWNoYW4vZGV2L3NjZW5hcmlvLWZsb3cvcGFja2FnZXMvY29yZS92aXRlLmNvbmZpZy50c1wiOy8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZXN0XCIgLz5cblxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiXG5pbXBvcnQgam90YWlEZWJ1Z0xhYmVsIGZyb20gXCJqb3RhaS9iYWJlbC9wbHVnaW4tZGVidWctbGFiZWxcIlxuaW1wb3J0IGpvdGFpUmVhY3RSZWZyZXNoIGZyb20gXCJqb3RhaS9iYWJlbC9wbHVnaW4tcmVhY3QtcmVmcmVzaFwiXG5pbXBvcnQgeyBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luIH0gZnJvbSBcIkBlc2J1aWxkLXBsdWdpbnMvbm9kZS1nbG9iYWxzLXBvbHlmaWxsXCJcbmltcG9ydCB7IE5vZGVNb2R1bGVzUG9seWZpbGxQbHVnaW4gfSBmcm9tIFwiQGVzYnVpbGQtcGx1Z2lucy9ub2RlLW1vZHVsZXMtcG9seWZpbGxcIlxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiBbeyBmaW5kOiBcIkAvXCIsIHJlcGxhY2VtZW50OiBgLi9zcmMvYCB9XSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KHtcbiAgICAgIGJhYmVsOiB7XG4gICAgICAgIHBsdWdpbnM6IFtqb3RhaVJlYWN0UmVmcmVzaCwgam90YWlEZWJ1Z0xhYmVsXSxcbiAgICAgICAgcHJlc2V0czogW1wiam90YWkvYmFiZWwvcHJlc2V0XCJdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBtb2RlID09PSBcImFuYWx5emVcIiAmJlxuICAgICAgdmlzdWFsaXplcih7XG4gICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgIGZpbGVuYW1lOiBcImFuYWx5emUvc3RhdHMuaHRtbFwiLFxuICAgICAgfSksXG4gICAgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbih7XG4gICAgICBwcm9jZXNzOiB0cnVlLFxuICAgICAgYnVmZmVyOiB0cnVlLFxuICAgIH0pLFxuICAgIE5vZGVNb2R1bGVzUG9seWZpbGxQbHVnaW4oKSxcbiAgXSxcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gIH0sXG59KSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTyx1QkFBdUI7QUFDOUIsU0FBUyxpQ0FBaUM7QUFDMUMsU0FBUyxpQ0FBaUM7QUFHMUMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxPQUFPLENBQUMsRUFBRSxNQUFNLE1BQU0sYUFBYSxTQUFTLENBQUM7QUFBQSxFQUMvQztBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osT0FBTztBQUFBLFFBQ0wsU0FBUyxDQUFDLG1CQUFtQixlQUFlO0FBQUEsUUFDNUMsU0FBUyxDQUFDLG9CQUFvQjtBQUFBLE1BQ2hDO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxTQUFTLGFBQ1AsV0FBVztBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLElBQ1osQ0FBQztBQUFBLElBQ0gsMEJBQTBCO0FBQUEsTUFDeEIsU0FBUztBQUFBLE1BQ1QsUUFBUTtBQUFBLElBQ1YsQ0FBQztBQUFBLElBQ0QsMEJBQTBCO0FBQUEsRUFDNUI7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxFQUNYO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
