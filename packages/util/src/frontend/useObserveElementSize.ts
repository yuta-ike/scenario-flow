import { useRef, useEffect } from "react"

type Size = {
  width: number
  height: number
}

export const useObserveElementSize = <Elm extends HTMLElement>(
  onUpdated: (size: Size) => void,
) => {
  const ref = useRef<Elm>(null)

  const onUpdatedRef = useRef(onUpdated)
  useEffect(() => {
    onUpdatedRef.current = onUpdated
  }, [onUpdated])

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect != null) {
        onUpdatedRef.current({ width: rect.width, height: rect.height })
      }
    })

    if (ref.current != null) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return ref
}
