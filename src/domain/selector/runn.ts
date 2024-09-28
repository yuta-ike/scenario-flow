import { atom } from "jotai"

import { routesAtom } from "../datasource/route"
import { routesToRunn } from "../runn/routesToRunn"
import { metaAtom } from "../datasource/meta"

export const runnFormatAtom = atom((get) => {
  const routes = get(routesAtom)
  const meta = get(metaAtom)
  return routesToRunn(routes, meta)
})
