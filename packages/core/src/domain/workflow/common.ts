import { Id } from "@scenario-flow/util"
import { Context, Effect } from "effect"

export type GenId = () => Id
export const GenId = Context.GenericTag<GenId>("GenId")
export const _genId = () => GenId.pipe(Effect.map((genId) => genId()))
