/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo } from "react"

import type { ContainerCls } from "./container"

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
  useEffect(() => {
    container.setContent(injected)
  }, [container, injected])

  const value = useMemo(() => container.getContent(), [container])

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
