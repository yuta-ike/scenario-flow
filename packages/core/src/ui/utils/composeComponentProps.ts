import type { ComponentPropsWithoutRef, ElementType } from "react"
import type { Empty } from "@/utils/typeUtil"

export type ComposeComponentProps<
  Elm extends ElementType,
  ExtensionType extends Record<string, unknown> = Empty,
> = Omit<ComponentPropsWithoutRef<Elm>, keyof ExtensionType> & ExtensionType
