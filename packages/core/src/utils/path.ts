export const joinPath = (base: string, relativePath: string) => {
  if (relativePath.startsWith("/")) {
    return `${base}${relativePath}`
  }

  return `${base}/${relativePath}`
}
