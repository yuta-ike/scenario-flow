/* eslint-disable react-refresh/only-export-components */
import "./globals.css"
import "./worker"
// For safari
import "core-js/proposals/iterator-helpers-stage-3-2"
import "core-js/proposals/regexp-escaping"

import { Buffer as BufferPolyfill } from "buffer"

import { StrictMode, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { IndexPage } from "./ui/page/index"

import type { InjectedContent } from "./injector/injector"

export type * from "./injector"

import { InjectedProvider } from "./ui/lib/provider"
import { ProjectContext } from "./ui/context/context"
import { Provider as JotaiProvider } from "jotai"
import { atomWithIdMap, Store } from "@scenario-flow/util/lib"
import { DevTools as JotaiDevTools } from "jotai-devtools"
import "jotai-devtools/styles.css"

// NOTE: polyfill https://github.com/vitejs/vite/discussions/2785
globalThis.Buffer = BufferPolyfill

const queryClient = new QueryClient()

type Props = {
  store: Store
  injected: InjectedContent
  projectContext: ProjectContext
}

export const Core = ({ store, injected, projectContext }: Props) => {
  useEffect(() => {
    return () => {
      atomWithIdMap.clear()
    }
  }, [])

  return (
    <StrictMode>
      <JotaiProvider store={store.store}>
        <QueryClientProvider client={queryClient}>
          <InjectedProvider
            injected={injected}
            projectContext={projectContext}
            store={store}
          >
            <IndexPage />
          </InjectedProvider>
        </QueryClientProvider>
        <JotaiDevTools />
      </JotaiProvider>
    </StrictMode>
  )
}
