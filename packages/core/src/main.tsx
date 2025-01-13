/* eslint-disable react-refresh/only-export-components */
import "./globals.css"
import "./worker"
// For safari
import "core-js/proposals/iterator-helpers-stage-3-2"
import "core-js/proposals/regexp-escaping"

import { Buffer as BufferPolyfill } from "buffer"

import { StrictMode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { IndexPage } from "./ui/page/index"
import { ContainerInitializer } from "./lib/container/initializer"
import { useContainer } from "./container"

import type { InjectedContent } from "./injector/injector"

export type * from "./injector"

import { success, error } from "@/utils/result"

export { success, error }

// NOTE: polyfill https://github.com/vitejs/vite/discussions/2785
globalThis.Buffer = BufferPolyfill

const queryClient = new QueryClient()

type Props = {
  injected: InjectedContent
}

const Core = ({ injected }: Props) => {
  const container = useContainer()

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ContainerInitializer<InjectedContent>
          container={container}
          injected={injected}
        >
          <IndexPage />
        </ContainerInitializer>
      </QueryClientProvider>
    </StrictMode>
  )
}

export default Core
