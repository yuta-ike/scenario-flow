import { atom } from "jotai"

import { routesAtom } from "../datasource/route"
import {
  DEFAULT_PATTERN_ID,
  globalVariablesByPatternIdAtom,
} from "../datasource/globalVariable"
import { decompose } from "../workflow/decompose"
import { metaAtom } from "../datasource/meta"

export const decomposedAtom = atom((get) => {
  const routes = get(routesAtom)
  const globalVariables = get(
    globalVariablesByPatternIdAtom(DEFAULT_PATTERN_ID),
  )
  const meta = get(metaAtom)
  return decompose(routes, globalVariables, meta)
})
