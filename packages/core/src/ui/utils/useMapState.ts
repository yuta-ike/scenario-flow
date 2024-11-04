import { useCallback, useMemo, useState } from "react"

export const useMapState = <Value>(init = new Map<string, Value>()) => {
  const [state, setState] = useState<Map<string, Value>>(init)

  const updateItem = useCallback((key: string, value: Value) => {
    setState((prev) => {
      const newState = new Map(prev)
      newState.set(key, value)
      return newState
    })
  }, [])

  const deleteItem = useCallback((key: string) => {
    setState((prev) => {
      const newState = new Map(prev)
      newState.delete(key)
      return newState
    })
  }, [])

  return useMemo(
    () => [state, { updateItem, deleteItem }] as const,
    [deleteItem, state, updateItem],
  )
}
