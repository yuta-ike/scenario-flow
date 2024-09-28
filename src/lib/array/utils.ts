export const sliceFormer = <Value>(array: Value[], target: Value) => {
  const index = array.indexOf(target)
  return array.slice(0, index)
}

export const sliceLatter = <Value>(array: Value[], target: Value) => {
  const index = array.indexOf(target)
  return array.slice(index + 1)
}

export const dedupeArrays = <Arr extends unknown[]>(arrays: Arr[]): Arr[] =>
  Object.values(
    Object.fromEntries(arrays.map((array) => [JSON.stringify(array), array])),
  )
