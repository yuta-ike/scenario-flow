export const parseNumber = (value: string): number | null => {
  const parsed = parseFloat(value)
  if (isNaN(parsed)) {
    return null
  }
  return parsed
}
