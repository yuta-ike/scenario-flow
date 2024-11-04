import { useCallback, useEffect, useMemo, useState } from "react"

export const useOverrideState = <State>(initState: State) => {
  const [state, _setState] = useState(initState)

  useEffect(() => {
    _setState(initState)
  }, [initState])

  const setState = useCallback((newState: Partial<State>) => {
    _setState((prevState) => ({
      ...prevState,
      ...newState,
    }))
  }, [])

  const resetState = useCallback(() => {
    _setState(initState)
  }, [initState])

  return useMemo(
    () => [state, { setState, resetState }] as const,
    [setState, state, resetState],
  )
}
