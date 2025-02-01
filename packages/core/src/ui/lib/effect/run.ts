import { Store } from "@scenario-flow/util/lib"
import { Effect } from "effect"
import { buildContext, Context } from "../../adapter/context"

export const run = <A, E>(
  store: Store,
  effect: Effect.Effect<A, E, Context>,
): A => Effect.runSync(Effect.provide(effect, buildContext(store)))

export const runAsync = <A, E>(
  store: Store,
  effect: Effect.Effect<A, E, Context>,
): Promise<A> => Effect.runPromise(Effect.provide(effect, buildContext(store)))
