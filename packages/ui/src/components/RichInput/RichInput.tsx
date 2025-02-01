import { searchFuzzy } from "@scenario-flow/util"
import { useMemo, useRef, useState } from "react"
import { createPortal, flushSync } from "react-dom"
import { getCaretCoordinates } from "./getCaretCooridates"
import { TbVariable } from "react-icons/tb"
import { ParsedFrag, parseEmbeddedTemplate } from "./parse"
import { SuggestButton, SuggestGroup } from "./SuggestButton"
import { CodeSpan } from "./CodeSpan"
import clsx from "clsx"
import { parseExpression } from "./parseExpression"

const protalRoot = document.getElementById("popover")!

const COMPLETION_LIST = new Map([
  ["{", "}"],
  ["(", ")"],
  ["[", "]"],
  ["'", "'"],
  ['"', '"'],
])

type RichInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggests?: SuggestGroup[]
  lang: "template" | "expression"
  headless?: boolean
  minRows?: number
}

export const RichInput = ({
  value,
  onChange,
  placeholder,
  suggests,
  lang,
  headless,
  minRows,
}: RichInputProps) => {
  const portalRef = useRef<HTMLDivElement>(null)

  const [suggestPrefix, setSuggestPrefix] = useState<string | null>(null)
  const [selectIndex, setSelectIndex] = useState(0)

  const frags = useMemo(
    () =>
      lang === "template"
        ? parseEmbeddedTemplate(value)
        : parseExpression(value),
    [value],
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value
    // 値の更新
    {
      const cursorPosition = e.target.selectionStart
      // '{' が入力された場合に '}' を自動補完
      const inserted = newValue[cursorPosition - 1]
      if (
        value.length < newValue.length &&
        inserted != null &&
        COMPLETION_LIST.has(inserted)
      ) {
        newValue =
          newValue.slice(0, cursorPosition) +
          COMPLETION_LIST.get(inserted)! +
          newValue.slice(cursorPosition)
        flushSync(() => {
          onChange(newValue)
        })
        // カーソルを補完した '}' の前に移動
        e.target.selectionStart = cursorPosition
        e.target.selectionEnd = cursorPosition
      } else {
        onChange(newValue)
      }
    }

    // caret位置の更新
    {
      const portalElm = portalRef.current
      if (portalElm == null) {
        return null
      }

      const textareaPos = e.target.getBoundingClientRect()
      const cursorPosition = e.target.selectionStart
      const { left, top } = getCaretCoordinates(e.target, cursorPosition)
      portalElm.style.left = `${textareaPos.left + left}px`
      portalElm.style.top = `${textareaPos.top + top + 16}px`

      if (lang === "template") {
        // 現在のキャレット位置が variable 内かどうかを判定
        const frag = parseEmbeddedTemplate(newValue).find(
          ({ type, start, end }) =>
            type === "variable" &&
            cursorPosition > start &&
            cursorPosition < end,
        )
        if (frag == null) {
          setSuggestPrefix(null)
        } else {
          setSuggestPrefix(frag.value)
        }
      } else {
        const parsed = parseExpression(newValue).find(
          ({ type, start, end }) =>
            type === "variable" &&
            start <= cursorPosition &&
            cursorPosition <= end,
        )
        if (parsed == null) {
          setSuggestPrefix(null)
        } else {
          setSuggestPrefix(parsed.value)
        }
      }
    }
  }

  const filtered = useMemo(() => {
    const flatten = suggests?.flatMap(({ variables }) => variables) ?? []

    if (suggestPrefix == null || suggestPrefix.length === 0) {
      return flatten
    }

    return searchFuzzy(suggestPrefix, flatten, { keys: ["name"] })
  }, [suggestPrefix])

  return (
    <>
      <div
        className={clsx(
          "relative w-full font-mono",
          !headless && "rounded border border-slate-200 bg-white",
        )}
        style={{
          minHeight: minRows != null ? `${minRows}lh` : undefined,
        }}
      >
        <textarea
          value={value}
          rows={1}
          onChange={handleChange}
          className="absolute inset-0 min-h-[1lh] resize-none bg-transparent p-2 text-sm text-transparent caret-slate-700 focus:outline-none"
          spellCheck={false}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              suggestPrefix != null &&
              0 < filtered.length
            ) {
              e.preventDefault()
              const prev = value
              const elm = e.target as HTMLTextAreaElement

              const { start, end } = frags.find(
                ({ type, start, end }) =>
                  type === "variable" &&
                  start <= elm.selectionStart &&
                  elm.selectionStart <= end,
              )!

              flushSync(() => {
                let former: string
                if (lang === "template") {
                  former =
                    prev.slice(0, start) +
                    "{{" +
                    filtered[selectIndex]!.name +
                    "}}"
                } else {
                  former = prev.slice(0, start) + filtered[selectIndex]!.name
                }
                onChange(former + prev.slice(end))
                elm.selectionStart = former.length
                elm.selectionEnd = former.length
              })

              setSuggestPrefix(null)
              setSelectIndex(0)
            } else if (e.key === "ArrowDown") {
              e.preventDefault()
              setSelectIndex((prev) => Math.min(prev + 1, filtered.length - 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setSelectIndex((prev) => Math.max(prev - 1, 0))
            } else if (e.key === "Escape") {
              e.preventDefault()
              setSuggestPrefix(null)
            }
          }}
        />
        <div className="z-10 min-h-[calc(1lh+16px)] whitespace-pre-line p-2 text-sm text-slate-700">
          {lang === "template" ? (
            frags.map((frag) => {
              const parsedFrag = frag as ParsedFrag
              return parsedFrag.type === "variable" ? (
                <span className="rounded bg-slate-200 text-slate-500 ring-1 ring-slate-400">
                  <span>{"{{"}</span>
                  <CodeSpan tokens={parsedFrag.parsed} />
                  <span>{"}}"}</span>
                </span>
              ) : (
                <span>{parsedFrag.value}</span>
              )
            })
          ) : (
            <CodeSpan tokens={frags} />
          )}
          {value.endsWith("\n") && " "}
        </div>
        {suggests != null && 0 < suggests.length && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <SuggestButton
              suggests={suggests}
              onInsert={(inserted) => {
                if (value.endsWith(" ")) {
                  onChange(value + inserted)
                } else {
                  onChange(value + " " + inserted)
                }
              }}
            />
          </div>
        )}
      </div>
      {createPortal(
        <div
          className="fixed min-w-[320px] rounded border border-slate-200 bg-white text-xs shadow-sm empty:hidden"
          hidden={suggestPrefix == null}
          ref={portalRef}
        >
          {filtered.map((variable, index) => (
            <button
              key={variable.name}
              data-selected={index === selectIndex}
              className="flex w-full items-center px-1 py-0.5 text-start font-mono text-slate-700 data-[selected=true]:bg-slate-200 data-[selected=true]:text-slate-900 data-[selected=true]:underline"
            >
              <div className="shrink-0 px-1">
                <TbVariable />
              </div>
              <div className="grow">{variable.name}</div>
            </button>
          ))}
        </div>,
        protalRoot,
      )}
    </>
  )
}
