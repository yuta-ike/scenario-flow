import "./editor.css"

import { EditorState } from "@codemirror/state"
import { basicSetup, EditorView } from "codemirror"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import clsx from "clsx"

import { getExtensions } from "./extensions"

type Lang = "javascript" | "json" | "yaml"

const importLangExtension = async (lang: Lang) => {
  if (lang === "javascript") {
    const { javascript } = await import("@codemirror/lang-javascript")
    return javascript()
  } else if (lang === "json") {
    const { json } = await import("@codemirror/lang-json")
    return json()
  } else {
    const { yaml } = await import("@codemirror/lang-yaml")
    return yaml()
  }
}

export type EditorRef = {
  insertValue: (value: string) => void
}

type EditorProps = {
  init?: string
  lang: Lang
  value?: string
  onChange?: (value: string) => void
  className?: string
  innerClassName?: string
  ref: EditorRef
}

export const Editor = forwardRef<EditorRef, EditorProps>(
  ({ init: _init, value, lang, onChange, className, innerClassName }, ref) => {
    const [init] = useState(_init)
    const editorElmRef = useRef<HTMLDivElement | null>(null)
    const editorRef = useRef<EditorView | null>(null)
    const initialized = useRef(false)

    const valueRef = useRef(value)

    useEffect(() => {
      const editorElm = editorElmRef.current
      if (
        editorElm == null ||
        editorRef.current != null ||
        initialized.current
      ) {
        return
      }

      const updateListenerExtension = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange?.(update.state.doc.toString())
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ;(async () => {
        initialized.current = true
        const langExtension = await importLangExtension(lang)
        const state = EditorState.create({
          doc: init,
          extensions: getExtensions([
            basicSetup,
            langExtension,
            updateListenerExtension,
          ]),
        })
        editorRef.current = new EditorView({
          state,
          parent: editorElm,
        })
        editorRef.current.dispatch({
          changes: {
            from: 0,
            to: editorRef.current.state.doc.length,
            insert: valueRef.current,
          },
        })
      })()
    }, [init, lang, onChange])

    useEffect(() => {
      const editor = editorRef.current
      if (editor == null) {
        return
      }
      if (value != null) {
        editor.dispatch({
          changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: value,
          },
        })
      }
    }, [value])

    useImperativeHandle(ref, () => ({
      insertValue: (value: string) => {
        const editor = editorRef.current
        if (editor == null) {
          return
        }
        const range = editor.state.selection.ranges[0]
        if (range == null) {
          return
        }
        editor.dispatch({
          changes: {
            from: range.from,
            to: range.to,
            insert: value,
          },
        })
      },
    }))

    return (
      <div
        className={clsx("overflow-hidden bg-[#2D2F3F] px-2 py-1", className)}
      >
        <div
          ref={editorElmRef}
          className={clsx("min-h-[4lh]", innerClassName)}
        />
      </div>
    )
  },
)
