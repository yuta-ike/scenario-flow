import { useCallback, useMemo, useState } from "react"

export const useToggle = (initialState = false) => {
  const [state, setState] = useState(initialState)
  const toggle = useCallback(() => setState((state) => !state), [])
  const setTrue = useCallback(() => setState(true), [])
  const setFalse = useCallback(() => setState(false), [])
  return useMemo(
    () => ({ state, toggle, setTrue, setFalse }),
    [setFalse, setTrue, state, toggle],
  )
}
