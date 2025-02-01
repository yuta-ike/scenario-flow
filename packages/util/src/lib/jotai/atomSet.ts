import { atom } from "jotai"

export const atomSet = <Value>(init: Iterable<Value>) =>
  atom<Set<Value>>(new Set<Value>(init))
