export const getRelativePath = (path: string, basePath: string): string => {
  const base = basePath.split("/")
  const target = path.split("/")

  let i = 0
  for (; i < Math.min(base.length, target.length); i++) {
    if (base[i] !== target[i]) {
      break
    }
  }

  return target.slice(i).join("/")
}
