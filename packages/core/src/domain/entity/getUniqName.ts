export const getUniqName = (
  candidateName: string,
  usedNames: string[],
  index = 1,
): string => {
  const suffix = index === 1 ? "" : `_${index}`
  if (!usedNames.includes(`${candidateName}${suffix}`)) {
    return `${candidateName}${suffix}`
  }
  return getUniqName(candidateName, usedNames, index + 1)
}
