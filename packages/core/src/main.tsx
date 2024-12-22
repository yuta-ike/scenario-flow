/* eslint-disable react-refresh/only-export-components */
import "./globals.css"
import "./worker"
// For safari
import "core-js/proposals/iterator-helpers-stage-3-2"

import { Buffer as BufferPolyfill } from "buffer"

import { StrictMode, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { IndexPage } from "./ui/page/index"
import { useContainerReady, useContainer } from "./ui/adapter/container"

import type { InjectedContent } from "./injector/injector"

export type * from "./injector"

export { success, error } from "@/utils/result"

const queryClient = new QueryClient()

// NOTE: polyfill https://github.com/vitejs/vite/discussions/2785
globalThis.Buffer = BufferPolyfill

type Props = {
  injected: InjectedContent
}

const Core = ({ injected }: Props) => {
  const container = useContainer()
  useEffect(() => {
    container.setContent(injected)
  }, [container, injected])

  const ready = useContainerReady()
  if (!ready) {
    return null
  }

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <IndexPage />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default Core
