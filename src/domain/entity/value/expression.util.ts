import type { Expression } from "./expression"

export const toExpression = (value: string) => value as Expression

export const resolveExpression = (
  expression: Expression,
  variables: Record<string, string>,
): string => {
  return Object.entries(variables).reduce<string>(
    (acc, [key, value]) => acc.replaceAll(new RegExp(`{${key}}`, "g"), value),
    expression,
  )
}
