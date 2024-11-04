import { Context, Effect } from "effect"

import type { Id } from "@/utils/idType"

export type GenId = () => Id
export const GenId = Context.GenericTag<GenId>("GenId")
export const _genId = () => GenId.pipe(Effect.map((genId) => genId()))
