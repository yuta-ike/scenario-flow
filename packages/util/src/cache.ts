type CacheOptions = {
  size: number
  ttl: number
}

const defaultCacheOptions: CacheOptions = {
  size: 100,
  ttl: 60 * 1000,
}

export const fcache = <Arg extends string, Res>(
  func: (args: Arg) => Res,
  { size, ttl } = defaultCacheOptions,
) => {
  const cache = new Map<Arg, Res>()
  const timer = new Map<Arg, NodeJS.Timeout>()

  return (input: Arg) => {
    if (cache.has(input)) {
      return cache.get(input)!
    }
    const result = func(input)
    cache.set(input, result)
    // キャッシュサイズを超えた場合は古いものを削除
    if (size < cache.size) {
      cache.delete(cache.keys().next().value!)
    }
    // タイマーがある場合はリセットして、再度ttlを設定
    if (timer.has(input)) {
      clearTimeout(timer.get(input)!)
    }
    timer.set(
      input,
      setTimeout(() => {
        cache.delete(input)
      }, ttl),
    )
    return result
  }
}
