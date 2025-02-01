import { Token } from "./parseExpression"

type CodeSpanProps = {
  tokens: Token[]
}

export const CodeSpan = ({ tokens }: CodeSpanProps) => {
  return (
    <>
      {tokens.map((token, index) =>
        token.type === "operator" ? (
          <span key={`${index}-${token.value}`} className="text-[#0084BC]">
            {token.value}
          </span>
        ) : token.type === "string" ? (
          <span key={`${index}-${token.value}`} className="text-[#51A14F]">
            {token.value}
          </span>
        ) : token.type === "variable" ? (
          <span key={`${index}-${token.value}`} className="text-[#986802]">
            {token.value}
          </span>
        ) : token.type === "number" ? (
          <span key={`${index}-${token.value}`} className="text-[#986802]">
            {token.value}
          </span>
        ) : token.type === "boolean" ? (
          <span key={`${index}-${token.value}`} className="text-[#986802]">
            {token.value}
          </span>
        ) : token.type === "comma" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === "period" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === "(" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === ")" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === "{" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === "}" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === "[" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === "]" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === "whitespace" ? (
          <span key={`${index}-${token.value}`} className="">
            {token.value}
          </span>
        ) : token.type === "unknown" ? (
          <span
            key={`${index}-${token.value}`}
            className="text-red-500 underline decoration-wavy"
          >
            {token.value}
          </span>
        ) : (
          // @ts-expect-error
          <span>{token.value}</span>
        ),
      )}
    </>
  )
}
