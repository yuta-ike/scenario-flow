import { KVItem } from "@scenario-flow/util"
import type { StripeSymbol, Transition } from "../type"

declare const _meta: unique symbol

export type Meta = {
  [_meta]: never
  // endpoint: string
  runners: KVItem[]
}

export const buildMeta = (params: StripeSymbol<Meta>): Meta => {
  return params as Meta
}

export const updateMeta: Transition<Meta, [endpoint: string]> = (
  meta,
  endpoint,
) => {
  return {
    ...meta,
    endpoint,
  }
}
