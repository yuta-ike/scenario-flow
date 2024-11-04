import { Effect } from "effect"

export const matrixEff = <ItemA, ItemB, A, E, R>(
  a: ItemA[],
  b: ItemB[],
  callback: (a: ItemA, b: ItemB) => Effect.Effect<A, E, R>,
) => Effect.all(a.flatMap((itemA) => b.map((itemB) => callback(itemA, itemB))))

export const matrixArr = <ItemA, ItemB, Result>(
  a: ItemA[],
  b: ItemB[],
  callback: (a: ItemA, b: ItemB) => Result,
) => a.flatMap((itemA) => b.map((itemB) => callback(itemA, itemB)))
