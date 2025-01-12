export const buildPath = (
  path: string,
  searchParams: Record<string, string> = {},
) => {
  const searchParamsString = new URLSearchParams(searchParams).toString()
  return `${path}${searchParamsString !== "" ? `?${searchParamsString}` : ""}`
}

export const parsePath = (path: string) => {
  return {
    path: path.split("?")[0]!,
    queryParams: Object.fromEntries(
      new URLSearchParams(path.split("?")[1]).entries(),
    ),
  }
}
