/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react"

import type { ContainerCls } from "@scenario-flow/util/lib"

const ContainerContext = createContext<object | null>(null)

type ContainerInitializerProps<ContainerContent> = {
  children: React.ReactNode
  container: ContainerCls<ContainerContent>
  injected: ContainerContent
}

export const ContainerInitializer = <ContainerContent,>({
  children,
  container,
  injected,
}: ContainerInitializerProps<ContainerContent>) => {
  const value = useSyncExternalStore(
    (onStoreChange) => container.subscribe(onStoreChange),
    () => container.getContent(),
  )

  useEffect(() => {
    container.setContent(injected)
  }, [container, injected])

  if (value == null) {
    return null
  }

  return (
    <ContainerContext.Provider value={value}>
      {children}
    </ContainerContext.Provider>
  )
}

export const useContainerContent = <ContainerContent,>(): ContainerContent => {
  const injected = useContext(ContainerContext)
  if (injected == null) {
    throw new Error("[Container] Content not found")
  }
  return injected as ContainerContent
}
