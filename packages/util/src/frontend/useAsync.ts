import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type AsyncState<Data> =
  | {
      isLoading: true
      error: null
      data: null
    }
  | {
      isLoading: false
      error: unknown
      data: null
    }
  | {
      isLoading: false
      error: null
      data: Data
    }

type UseAsyncReturn<Data = unknown> = AsyncState<Data> & { refetch: () => void }

export const useAsync = <Data = unknown>(
  fetcher: () => Promise<Data> | Data,
): UseAsyncReturn<Data> => {
  const fetcherRef = useRef<() => Promise<Data> | Data>(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const [state, setState] = useState<AsyncState<Data>>({
    isLoading: true,
    error: null,
    data: null,
  })

  const fetchFn = useCallback(async () => {
    try {
      const data = await fetcherRef.current()
      setState({ isLoading: false, error: null, data })
    } catch (error) {
      setState({ isLoading: false, error, data: null })
    }
  }, [])

  useEffect(() => {
    void fetchFn()
  }, [fetchFn])

  return useMemo(() => ({ ...state, refetch: fetchFn }), [fetchFn, state])
}
