export const buildPath = (
  path: string,
  searchParams: Record<string, string> = {},
) => {
  const searchParamsString = new URLSearchParams(searchParams).toString()
  return `${path}${searchParamsString !== "" ? `?${searchParamsString}` : ""}`
}

export const parsePath = (path: string) => {
  const url = new URL(path, "http://dummy.example.com")
  return {
    path: url.pathname,
    queryParams: Object.fromEntries(url.searchParams),
  }
}
