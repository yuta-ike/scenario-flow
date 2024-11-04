import fuzzysort from "fuzzysort"

export const searchFuzzy = <Item>(
  searchText: string,
  items: Item[],
  options: {
    keys: (((item: Item) => string) | (keyof Item & string))[]
  },
) => fuzzysort.go(searchText, items, options).map((res) => res.obj)
