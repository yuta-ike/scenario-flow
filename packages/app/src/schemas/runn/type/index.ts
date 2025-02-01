import { Convert } from "./runbook.gen"

import type { RunBook } from "./runbook.gen"

export * from "./runbook"

export const parseToRunbook = (raw: string): RunBook => Convert.toRunBook(raw)
export const serializeRunbook = (runbook: RunBook): string =>
  Convert.runBookToJson(runbook)
