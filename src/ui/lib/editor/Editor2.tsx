import "./editor.css"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import {
  languages,
  editor as monacoEditor,
  Range,
} from "monaco-editor/esm/vs/editor/editor.api"
import clsx from "clsx"

import type { SchemaObject } from "openapi3-ts/oas31"

import {
  getVariableDisplay,
  type ResolvedEnvironment,
} from "@/domain/entity/environment/environment"

const highlightVariables = (
  model: monacoEditor.ITextModel,
  decorators: string[][],
) => {
  // 変数のハイライト
  // TODO: ハイライトを消す部分は未実装
  const ret = model
    .findMatches(`\\{\\{[^\\{\\}]+\\}\\}`, false, true, false, null, false)
    .map((match) =>
      model.deltaDecorations(decorators.pop() ?? [], [
        {
          range: match.range,
          options: {
            isWholeLine: false,
            inlineClassName: "variable",
          },
        },
      ]),
    )
  decorators.forEach((decorator) => model.deltaDecorations(decorator, []))
  return ret
}

export type EditorRef = {
  insertValue: (value: string) => void
}

type Props = {
  lang: "json" | "yaml" | "plaintext"
  initValue: string
  onChange?: (value: string) => void
  environment?: ResolvedEnvironment
  schema?: SchemaObject
  className?: string
  fitHeight?: boolean
  readOnly?: boolean
}

export const Editor2 = forwardRef<EditorRef, Props>(
  (
    {
      lang,
      initValue: _initValue,
      onChange,
      environment = [],
      fitHeight = false,
      className,
      schema,
      readOnly,
    },
    ref,
  ) => {
    const [initValue] = useState(_initValue)
    const onChangeRef = useRef(onChange)
    useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])

    const [editor, setEditor] =
      useState<monacoEditor.IStandaloneCodeEditor | null>(null)
    const monacoEl = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const elm = monacoEl.current
      if (elm == null) {
        return
      }

      let editor: monacoEditor.IStandaloneCodeEditor | null = null
      setEditor((_editor) => {
        editor = _editor
        if (_editor != null) return _editor

        const newEditor = monacoEditor.create(elm, {
          value: initValue,
          language: lang,
          theme: "vs-dark",
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          suggest: {},
          scrollBeyondLastLine: false,
          padding: { top: 10, bottom: 10 },
          readOnly,
        })

        const model = newEditor.getModel()
        let decorators: string[][] = []
        if (model != null) {
          model.onDidChangeContent(() => {
            onChangeRef.current?.(newEditor.getValue())
            decorators = highlightVariables(model, decorators)
          })

          decorators = highlightVariables(model, decorators)
        }

        if (fitHeight) {
          newEditor.onDidContentSizeChange(() => {
            const contentHeight = Math.max(
              Math.min(1000, newEditor.getContentHeight()),
              100,
            )
            monacoEl.current?.style.setProperty("height", `${contentHeight}px`)
            newEditor.layout({ width: 567, height: contentHeight })
          })
        }

        return newEditor
      })

      return () => {
        editor?.dispose()
      }
    }, [fitHeight, initValue, lang])

    // スキーマ
    useEffect(() => {
      if (schema == null) {
        return
      }
      languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: "https://example.com",
            fileMatch: ["*"],
            schema,
          },
        ],
      })
    }, [schema])

    // 補完
    useEffect(() => {
      const dispose = languages.registerCompletionItemProvider(lang, {
        triggerCharacters: ["{"],
        provideCompletionItems: (model, position, context) => {
          const word = model.getWordUntilPosition(position)
          return {
            incomplete: false,
            suggestions: environment.map((bind) => ({
              label: `{{${getVariableDisplay(bind)}}}`,
              detail: `[${bind.variable.boundIn === "global" ? "グローバル変数" : "変数"}] ${bind.variable.description}`,
              documentation: bind.variable.description,
              kind: languages.CompletionItemKind.Keyword,
              insertText: `{{${getVariableDisplay(bind)}.$0}}`,
              insertTextRules:
                languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn:
                  context.triggerKind ===
                  languages.CompletionTriggerKind.TriggerCharacter
                    ? word.startColumn - 1
                    : word.startColumn,
                endColumn: word.endColumn,
              },
            })),
          }
        },
      })
      return () => dispose.dispose()
    }, [environment, lang])

    useImperativeHandle(ref, () => ({
      insertValue: (value: string) => {
        if (editor == null) {
          return
        }
        const line = editor.getPosition()
        if (line == null) {
          return
        }

        const range = new Range(
          line.lineNumber,
          line.column,
          line.lineNumber,
          line.column,
        )
        const op = {
          identifier: { major: 1, minor: 1 },
          range,
          text: value,
          forceMoveMarkers: true,
        }
        editor.executeEdits("my-source", [op])
      },
    }))

    return (
      <div
        className={clsx("relative min-h-[4lh]", className)}
        style={{
          height: editor?.getContentHeight(),
        }}
        ref={monacoEl}
      />
    )
  },
)