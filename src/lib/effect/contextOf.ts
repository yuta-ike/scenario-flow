import { type Effect } from "effect"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextOf<Eff extends (...unknown: any[]) => unknown> =
  ReturnType<Eff> extends Effect.Effect<unknown, unknown, infer Context>
    ? Context
    : never
