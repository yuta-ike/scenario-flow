import { atom } from "jotai"

import type { Meta } from "../entity/meta/meta"

export const metaAtom = atom<Meta>({
  endpoint: "https://api.example.com",
})
