import { useCallback, useMemo, useState } from "react"

export const useSetState = <Option extends string = string>(
  init: Option[] = [],
) => {
  const [state, setState] = useState<Option[]>(init)

  const add = useCallback(
    (option: Option) => setState((prev) => [...prev, option]),
    [],
  )
  const remove = useCallback(
    (option: Option) => setState((prev) => prev.filter((o) => o !== option)),
    [],
  )
  const toggle = useCallback(
    (option: Option) =>
      setState((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option],
      ),
    [],
  )

  return useMemo(
    () => [state, { add, remove, toggle }] as const,
    [state, add, remove, toggle],
  )
}
