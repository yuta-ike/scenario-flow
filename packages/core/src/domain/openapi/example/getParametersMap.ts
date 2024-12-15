import { isNotRef } from "../isNotRef"

import { getExample } from "./exampleUtil"

import type {
  ParameterLocation,
  ParameterObject,
  ReferenceObject,
} from "openapi3-ts/oas31"
import type { KVItem } from "@/ui/lib/kv"

export const getParametersMap = (
  parameters?: (ParameterObject | ReferenceObject)[],
): Map<ParameterLocation, KVItem[]> | undefined =>
  parameters
    ?.filter(isNotRef)
    .reduce((map, { name, in: location, example, examples }) => {
      map.set(location, [
        ...(map.get(location) ?? []),
        {
          id: name,
          key: name,
          value: getExample(example, examples) ?? "",
        },
      ])
      return map
    }, new Map<ParameterLocation, KVItem[]>())
