import { atom } from "jotai"

import { routesAtom } from "../datasource/route"
import {
  DEFAULT_PATTERN_ID,
  globalVariablesByPatternIdAtom,
} from "../datasource/globalVariable"
import { decompose } from "../workflow/decompose"
import { metaAtom } from "../datasource/meta"
import { resourcesAtom } from "../datasource/resource"

export const decomposedAtom = atom((get) => {
  const routes = get(routesAtom)
  const globalVariables = get(
    globalVariablesByPatternIdAtom(DEFAULT_PATTERN_ID),
  )
  const resourceMap = new Map(
    get(resourcesAtom).map((resource) => [resource.id, resource]),
  )
  const meta = get(metaAtom)
  return decompose(routes, globalVariables, resourceMap, meta)
})
