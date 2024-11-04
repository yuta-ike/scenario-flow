import { describe, expect, test, vi } from "vitest"

import { getUpdateOps } from "./arrayUpdate"

describe("updateWhen", () => {
  test("[仕様] 条件にマッチする項目が更新される", () => {
    const state = [1, 2, 3]

    const setState = vi.fn<
      (update: number[] | ((value: number[]) => void)) => void
    >((update) => {
      const res = typeof update === "function" ? update(state) : update
      expect(res).toEqual([1, 3, 3])
    })

    const { updateWhen } = getUpdateOps(setState)

    updateWhen({
      update: (item) => {
        console.log("#update", item + 1)
        return item + 1
      },
      when: (item) => {
        console.log("#when", item)
        return item === 2
      },
    })
  })

  test("[仕様] 条件にマッチする項目がなければ更新されない", () => {
    const state = [1, 2, 3]

    const setState = vi.fn<
      (update: number[] | ((value: number[]) => void)) => void
    >((update) => {
      const res = typeof update === "function" ? update(state) : update
      expect(res).toEqual([1, 2, 3])
    })

    const { updateWhen } = getUpdateOps(setState)

    updateWhen({
      update: (item) => {
        console.log("#update", item + 1)
        return item + 1
      },
      when: (item) => {
        console.log("#when", item)
        return item === 4
      },
    })
  })

  test("[仕様] 条件にマッチする項目が複数あれば全て更新される", () => {
    const state = [1, 2, 3, 2]

    const setState = vi.fn<
      (update: number[] | ((value: number[]) => void)) => void
    >((update) => {
      const res = typeof update === "function" ? update(state) : update
      expect(res).toEqual([1, 3, 3, 3])
    })

    const { updateWhen } = getUpdateOps(setState)

    updateWhen({
      update: (item) => {
        console.log("#update", item + 1)
        return item + 1
      },
      when: (item) => {
        console.log("#when", item)
        return item === 2
      },
    })
  })
})

describe("upsertWhen", () => {
  test("[仕様] 条件にマッチする項目が更新される", () => {
    const state = [1, 2, 3]

    const setState = vi.fn<
      (update: number[] | ((value: number[]) => void)) => void
    >((update) => {
      const res = typeof update === "function" ? update(state) : update
      expect(res).toEqual([1, 3, 3])
    })

    const { upsertWhen } = getUpdateOps(setState)

    upsertWhen({
      update: (item) => {
        console.log("#update", item + 1)
        return item + 1
      },
      create: () => {
        console.log("#create")
        return 4
      },
      when: (item) => {
        console.log("#when", item)
        return item === 2
      },
    })
  })

  test("[仕様] 条件にマッチする項目がなければ新規作成される", () => {
    const state = [1, 2, 3]

    const setState = vi.fn<
      (update: number[] | ((value: number[]) => void)) => void
    >((update) => {
      const res = typeof update === "function" ? update(state) : update
      expect(res).toEqual([1, 2, 3, 4])
    })

    const { upsertWhen } = getUpdateOps(setState)

    upsertWhen({
      update: (item) => {
        console.log("#update", item + 1)
        return item + 1
      },
      create: () => {
        console.log("#create")
        return 4
      },
      when: (item) => {
        console.log("#when", item)
        return item === 5
      },
    })
  })

  test("[仕様] 条件にマッチする項目が複数あれば全て更新される", () => {
    const state = [1, 2, 3, 2]

    const setState = vi.fn<
      (update: number[] | ((value: number[]) => void)) => void
    >((update) => {
      const res = typeof update === "function" ? update(state) : update
      expect(res).toEqual([1, 3, 3, 3])
    })

    const { upsertWhen } = getUpdateOps(setState)

    upsertWhen({
      update: (item) => {
        console.log("#update", item + 1)
        return item + 1
      },
      create: () => {
        console.log("#create")
        return 4
      },
      when: (item) => {
        console.log("#when", item)
        return item === 2
      },
    })
  })
})
