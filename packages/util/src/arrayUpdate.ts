import { useState } from "react"

import type { Dispatch, SetStateAction } from "react"

export const useArrayState = <Item>(initState: Item[] | (() => Item[])) => {
  const [state, setState] = useState(initState)

  return [state, getUpdateOps(setState)] as const
}

export const getUpdateOps = <Item>(
  setState: Dispatch<SetStateAction<Item[]>>,
) => {
  const unshift = (item: Item) => {
    setState((prev) => [item, ...prev])
  }
  const append = (item: Item) => {
    setState((prev) => [...prev, item])
  }

  const insert = (item: Item, index: number) => {
    setState((prev) => {
      const newState = [...prev]
      newState.splice(index, 0, item)
      return newState
    })
  }

  const updateWhen = ({
    update,
    when,
  }: {
    update: (item: Item) => Item
    when: (item: Item) => boolean
  }) => {
    setState((prev) => prev.map((item) => (when(item) ? update(item) : item)))
  }

  const upsertWhen = ({
    update,
    create,
    when,
  }: {
    update: (item: Item) => Item
    create: () => Item
    when: (item: Item) => boolean
  }) => {
    setState((prev) => {
      let isUpdated = false
      const res: Item[] = []
      for (const item of prev) {
        if (when(item)) {
          isUpdated = true
          res.push(update(item))
        } else {
          res.push(item)
        }
      }
      if (!isUpdated) {
        res.push(create())
      }
      return res
    })
  }

  const remove = (index: number) => {
    setState((prev) => prev.filter((_, i) => i !== index))
  }

  const removeWhen = (when: (item: Item) => boolean) => {
    setState((prev) => {
      return prev.flatMap((item) => (when(item) ? [] : item), 1)
    })
  }

  const replace = (newItem: Item, index: number) => {
    setState((prev) => {
      const newState = [...prev]
      newState.splice(index, 1, newItem)
      return newState
    })
  }

  const replaceWhen = (newItem: Item, when: (item: Item) => boolean) => {
    updateWhen({ when, update: () => newItem })
  }

  return {
    setState,
    append,
    unshift,
    insert,
    updateWhen,
    upsertWhen,
    remove,
    removeWhen,
    replace,
    replaceWhen,
  }
}
