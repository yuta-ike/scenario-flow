export const normalizePath = (path: string) => {
  let frags = path.split("/")

  while (frags[0] === "." || frags[0] === "") {
    frags = frags.slice(1)
  }

  return frags
}

export const resolvePath = (currentPath: string, relativePath: string) => {
  const currentFrags = normalizePath(currentPath)
  const relativeFrags = normalizePath(relativePath)

  const frags = relativeFrags.reduce((acc, frag) => {
    if (frag === "..") {
      return acc.slice(0, -1)
    }
    return [...acc, frag]
  }, currentFrags)

  return frags.join("/")
}
