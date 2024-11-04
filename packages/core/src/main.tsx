import "./globals.css"
import "./worker"
// For safari
import "core-js/proposals/iterator-helpers-stage-3-2"

import { Buffer as BufferPolyfill } from "buffer"

import { StrictMode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { IndexPage } from "./ui/page/index"

export * from "./injector"

const queryClient = new QueryClient()

// NOTE: polyfill https://github.com/vitejs/vite/discussions/2785
globalThis.Buffer = BufferPolyfill

const Core = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <IndexPage />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default Core
