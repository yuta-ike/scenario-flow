import { Provider as JotaiProvider } from "jotai"

import { store } from "./store"
import { buildContext } from "./context"

export type ProviderProps = {
  children: React.ReactNode
}

export const Provider = ({ children }: ProviderProps) => {
  return <JotaiProvider store={store.store}>{children}</JotaiProvider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const context = buildContext(store)
