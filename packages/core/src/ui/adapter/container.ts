import { useCallback, useSyncExternalStore } from "react"

import { container } from "@/injector"

// Containerのメソッドにアクセスする用途
export const useContainer = () =>
  useSyncExternalStore(
    useCallback((listener) => container.subscribe(listener), []),
    useCallback(() => container, []),
  )

const useInjectedNullable = () =>
  useSyncExternalStore(
    useCallback((listener) => container.subscribe(listener), []),
    useCallback(() => container.getContent(), []),
  )

export const useInjected = () => {
  const injected = useInjectedNullable()
  if (injected == null) {
    throw new Error("[Error] Content not found (Container)")
  }
  return injected
}

export const useContainerReady = () => {
  const injected = useInjectedNullable()
  return injected != null
}
