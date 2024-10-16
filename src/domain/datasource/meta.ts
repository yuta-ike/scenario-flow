import { atom } from "jotai"

import { buildMeta, type Meta } from "../entity/meta/meta"

export const metaAtom = atom<Meta>(
  buildMeta({
    endpoint: "https://api.example.com",
  }),
)
