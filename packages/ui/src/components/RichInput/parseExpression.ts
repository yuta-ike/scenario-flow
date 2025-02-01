export type Token =
  | { type: "operator"; value: string; start: number; end: number }
  | { type: "number"; value: string; start: number; end: number }
  | { type: "string"; value: string; start: number; end: number }
  | { type: "boolean"; value: string; start: number; end: number }
  | { type: "variable"; value: string; start: number; end: number }
  | { type: "("; value: string; start: number; end: number }
  | { type: ")"; value: string; start: number; end: number }
  | { type: "{"; value: string; start: number; end: number }
  | { type: "}"; value: string; start: number; end: number }
  | { type: "["; value: string; start: number; end: number }
  | { type: "]"; value: string; start: number; end: number }
  | { type: "comma"; value: string; start: number; end: number }
  | { type: "period"; value: string; start: number; end: number }
  | { type: "whitespace"; value: string; start: number; end: number }
  | { type: "unknown"; value: string; start: number; end: number }

const TOKEN_RULES = [
  [
    "operator",
    /^(?<value>\*\*|\+|-|\*|\/|%|\^|==|!=|<=|>=|<|>|and|&&|or|\|\||not|!|\?:|\?\?|\?\.|in|contains|startsWith|endsWith|matches)/,
  ],
  ["number", /^(?<value>[0-9]+\.?[0-9]*)/],
  ["string", /^(?<value>\"[^\"]*\")/],
  ["string", /^(?<value>\'[^\']*\')/],
  ["boolean", /^(?<value>true|false)/],
  ["variable", /^(?<value>[a-zA-Z_][a-zA-Z0-9_]*)/],
  ["(", /^(?<value>\()/],
  [")", /^(?<value>\))/],
  ["{", /^(?<value>\{)/],
  ["}", /^(?<value>\})/],
  ["[", /^(?<value>\[)/],
  ["]", /^(?<value>\])/],
  ["comma", /^(?<value>,)/],
  ["period", /^(?<value>\.)/],
  ["whitespace", /^(?<value>\s+)/],
] as const

export const parseExpression = (_input: string): Token[] => {
  const tokens = []
  let input = _input
  let index = 0
  try {
    while (0 < input.length) {
      let matched = false
      for (const [type, rule] of TOKEN_RULES) {
        const match = input.match(rule)
        if (match == null) {
          continue
        }
        matched = true
        const value = match.groups?.["value"]
        if (value == null) {
          tokens.push({
            type: "unknown" as const,
            value: input[0]!,
            start: index,
            end: index + 1,
          })
          input = input.slice(1)
          index = index + 1
          continue
        }
        tokens.push({ type, value, start: index, end: index + match[0].length })
        index = index + match[0].length
        input = input.slice(match[0].length)
        break
      }
      if (!matched) {
        tokens.push({
          type: "unknown" as const,
          value: input[0]!,
          start: index,
          end: index + 1,
        })
        index = index + 1
        input = input.slice(1)
        continue
      }
    }
    return tokens
  } catch {
    return [
      ...tokens,
      {
        type: "unknown",
        value: input,
        start: index,
        end: index + input.length,
      },
    ]
  }
}
