import "jotai-devtools/styles.css"

import { useAtomValue } from "jotai"
import { useEffect } from "react"

import { projectContextAtom, type ProjectContext } from "../context/context"

import { store } from "./store"

export type ProviderProps = {
  children: React.ReactNode
  context: ProjectContext
}

export const ProjectContextProvider = ({
  children,
  context,
}: ProviderProps) => {
  const value = useAtomValue(projectContextAtom)

  useEffect(() => {
    store.set(projectContextAtom, context)
  }, [context])

  if (value == null) {
    return null
  }

  return children
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectContext = () => {
  const context = useAtomValue(projectContextAtom)
  if (context == null) {
    throw new Error("Context is not set.")
  }
  return context
}
