import type { ComponentPropsWithoutRef, ElementType } from "react"
import { Empty } from "@scenario-flow/util"

export type ComposeComponentProps<
  Elm extends ElementType,
  ExtensionType extends Record<string, unknown> = Empty,
> = Omit<ComponentPropsWithoutRef<Elm>, keyof ExtensionType> & ExtensionType
