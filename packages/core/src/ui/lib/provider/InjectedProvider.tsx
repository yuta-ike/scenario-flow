import { Store } from "@scenario-flow/util/lib"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import { InjectedContent } from "../../../injector"
import { ProjectContext } from "../../context/context"
import { createStore } from "jotai"

type JotaiStore = ReturnType<typeof createStore>

const InjectedContext = createContext<{
  injected: InjectedContent
  projectContext: ProjectContext
  store: Store
} | null>(null)

type InjectedProviderProps = {
  injected: InjectedContent
  projectContext: ProjectContext
  children: React.ReactNode
  store: Store
}

export const InjectedProvider = ({
  injected,
  projectContext,
  children,
  store,
}: InjectedProviderProps) => {
  const value = useMemo(
    () => ({ injected, projectContext, store }),
    [injected, projectContext, store],
  )
  return (
    <InjectedContext.Provider value={value}>
      {children}
    </InjectedContext.Provider>
  )
}

export const useInjected = () => {
  const value = useContext(InjectedContext)
  if (value == null) {
    throw new Error("Injected is not set.")
  }
  return value.injected
}

export const useProjectContext = () => {
  const value = useContext(InjectedContext)
  if (value == null) {
    throw new Error("Injected is not set.")
  }
  return value.projectContext
}

export const useStore = () => {
  const value = useContext(InjectedContext)
  if (value == null) {
    throw new Error("Injected is not set.")
  }

  const store = value.store

  const [_, setUpdate] = useState(0)
  useEffect(() => {
    return store.subscribeStore(() => {
      setUpdate((v) => v + 1)
    })
  }, [store])

  return store
}
