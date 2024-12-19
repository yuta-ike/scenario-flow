export const getUniqName = (
  candidateName: string,
  usedNames: string[],
  index = 1,
): string => {
  if (!usedNames.includes(`${candidateName}${index === 1 ? "" : index}`)) {
    return `${candidateName}${index === 1 ? "" : index}`
  }
  return getUniqName(candidateName, usedNames, index + 1)
}
