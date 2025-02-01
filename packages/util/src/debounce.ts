import { useEffect, useRef } from "react"

type AnyFunc = (...args: unknown[]) => unknown

export const debounce = <Func extends AnyFunc>(
  callback: Func,
  delayMs: number,
) => {
  let timeoutId: NodeJS.Timeout | null = null

  const wrapper = (...args: Parameters<Func>) => {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = null
      callback(args)
    }, delayMs)
  }

  const cancel = () => {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const dispatchImmediately = () => {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    callback()
  }

  wrapper.cancel = cancel
  wrapper.dispatchImmediately = dispatchImmediately

  return wrapper
}

export const useDebounce = <Func extends AnyFunc>(
  callback: Func,
  delayMs: number,
) => {
  const delayMsFreezedRef = useRef(delayMs)
  const callbackRef = useRef(debounce(callback, delayMs))

  useEffect(() => {
    callbackRef.current.cancel()
    callbackRef.current = debounce(callback, delayMsFreezedRef.current)
  }, [callback])

  return callbackRef.current
}
