/* eslint-disable react-refresh/only-export-components */
import "./globals.css"

import { StrictMode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createStore } from "@scenario-flow/util/lib"
import { success, error } from "@scenario-flow/util"

import { IndexPage } from "./ui/page/index"
import { ContainerInitializer } from "./lib/container/initializer"
import { useContainer } from "./container"

import type { InjectedContent } from "./injector/injector"

export type * from "./injector"

export { success, error }

const queryClient = new QueryClient()

const store = createStore()

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
          <IndexPage store={store} />
        </ContainerInitializer>
      </QueryClientProvider>
    </StrictMode>
  )
}

export default Core
