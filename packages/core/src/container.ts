import { useCallback, useSyncExternalStore } from "react"

import { ContainerCls } from "./lib/container/container"
import { useContainerContent } from "./lib/container/initializer"

import type { InjectedContent } from "./injector"

const container = new ContainerCls<InjectedContent>()

export const useContainer = () =>
  useSyncExternalStore(
    useCallback((listener) => container.subscribe(listener), []),
    useCallback(() => container, []),
  )

export const useInjected = () => useContainerContent<InjectedContent>()
