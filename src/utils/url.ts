export const buildPath = (
  path: string,
  searchParams: Record<string, string> = {},
) => {
  const searchParamsString = new URLSearchParams(searchParams).toString()
  return `${path}${searchParamsString !== "" ? `?${searchParamsString}` : ""}`
}
