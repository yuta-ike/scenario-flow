import "./globals.css"
import "jotai-devtools/styles.css"

import { Buffer as BufferPolyfill } from "buffer"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { DevTools } from "jotai-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Provider } from "./ui/adapter/provider"
import { IndexPage } from "./ui/page/index"

// NOTE: polyfill https://github.com/vitejs/vite/discussions/2785
// @ts-expect-error
globalThis.Buffer = BufferPolyfill

const queryClient = new QueryClient()

const root = document.getElementById("root")

if (root == null) {
  throw new Error("No root element found")
}

createRoot(root).render(
  <StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <IndexPage />
        {/* <TestPage /> */}
        <DevTools />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
