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

export const dedupe = <Item>(
  arr: Item[],
  accessor: (item: Item) => unknown = (x) => x,
): Item[] =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Object.values(Object.fromEntries(arr.map((item) => [accessor(item), item])))
