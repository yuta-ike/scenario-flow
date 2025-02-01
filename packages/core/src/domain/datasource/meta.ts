import { atom } from "jotai"

import { buildMeta, type Meta } from "../entity/meta/meta"

export const metaAtom = atom<Meta>(
  buildMeta({
    runners: [
      {
        id: "req",
        key: "req",
        value: "http://localhost:3000",
      },
    ],
  }),
)
