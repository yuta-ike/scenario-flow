import { nonNull } from "@scenario-flow/util"

export type Expression = string & { __expression: never }

const PLACEHOLDER_REGEXP =
  /\{\{\s*(?<variable>[^({|})\s]+(?:\s+[^({|})\s]+)*)\s*\}\}/g

const MATCH_INDEX_ACCESSOR_REGEXP = /\[\s*(?<accessor>\w+)\s*]/g

const makePlaceholderVariableRegexp = (variable: string) =>
  new RegExp(`\\{\\{\\s*${RegExp.escape(variable)}\\s*\\}\\}`, "g")

const genVariableName = (expression: string, index: number) => {
  const lastFragment = expression.split(".").at(-1)
  if (lastFragment == null) {
    return `var${index}`
  }
  const res = lastFragment.replaceAll(
    MATCH_INDEX_ACCESSOR_REGEXP,
    "$<accessor>",
  )
  if (!/^\w+$/.test(res)) {
    return `var${index}`
  }
  return res
}

export const getPlaceholderExpressions = (value: string) => {
  const matches = value.matchAll(PLACEHOLDER_REGEXP)
  return Array.from(matches, (match) => match.groups?.["variable"]).filter(
    nonNull,
  )
}

export const parseExpressionInPath = (
  value: string,
): [path: Expression, pathParams: { name: string; value: string }[]] => {
  const placeholderExpressions = getPlaceholderExpressions(value)
  if (placeholderExpressions.length === 0) {
    return [value as Expression, []]
  }

  const expressionVariableMap = new Map(
    placeholderExpressions.map((expression, i) => [
      expression,
      { name: genVariableName(expression, i + 1), value: expression },
    ]),
  )

  const parsedExpression = expressionVariableMap
    .entries()
    .reduce<string>(
      (acc, [expression, { name: variableName }]) =>
        acc.replaceAll(
          makePlaceholderVariableRegexp(expression),
          `{{ ${variableName} }}`,
        ),
      value,
    ) as Expression

  return [parsedExpression, expressionVariableMap.values().toArray()]
}

export const resolveExpression = (
  expression: Expression,
  variables: Record<string, string>,
): string => {
  return Object.entries(variables).reduce<string>(
    (acc, [key, value]) =>
      acc.replaceAll(
        new RegExp(makePlaceholderVariableRegexp(key), "g"),
        value,
      ),
    expression,
  )
}
