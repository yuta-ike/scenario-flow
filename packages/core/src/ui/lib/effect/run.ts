import { Effect } from "effect"

import type { Context as EffectContext } from "effect"
import type { Context } from "@/ui/adapter/context"

import { buildContext } from "@/ui/adapter/context"
import { store } from "@/ui/adapter/store"

export const run = <A, E>(effect: Effect.Effect<A, E, Context>): A =>
  Effect.runSync(Effect.provide(effect, buildContext(store)))

export const runAsync = <A, E>(
  effect: Effect.Effect<A, E, Context>,
): Promise<A> => Effect.runPromise(Effect.provide(effect, buildContext(store)))

export const runWithContext = <A, E>(
  effect: Effect.Effect<A, E, Context>,
  context: EffectContext.Context<Context>,
): A => Effect.runSync(Effect.provide(effect, context))
