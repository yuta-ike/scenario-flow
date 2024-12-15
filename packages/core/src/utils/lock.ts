/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/return-await */

export const lock = <Callback extends (...args: any[]) => any>(
  func: Callback,
) => {
  let locked = false
  let promise: Promise<ReturnType<Callback>> | undefined
  return async (...args: Parameters<Callback>) => {
    if (locked) {
      await promise
      promise = undefined
    }
    try {
      locked = true
      promise = func(...args)
      return promise
    } finally {
      locked = false
    }
  }
}

export const debouncedLock = <Callback extends (...args: any[]) => any>(
  func: Callback,
  delay = 500,
) => {
  let locked = false
  let promise: Promise<ReturnType<Callback>> | undefined
  let timeout: NodeJS.Timeout | undefined

  return async (...args: Parameters<Callback>) => {
    if (locked) {
      await promise
    }
    try {
      locked = true
      promise = new Promise<void>((resolve) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          resolve()
          timeout = undefined
        }, delay)
      }).then(() => func(...args))
      return promise
    } finally {
      locked = false
    }
  }
}
