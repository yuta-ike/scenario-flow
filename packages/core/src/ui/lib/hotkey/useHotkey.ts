import { useEffect, useRef } from "react"

// https://developer.mozilla.org/ja/docs/Web/API/UI_Events/Keyboard_event_key_values
export const useHotkey = <Elm extends HTMLElement = HTMLElement>(
  key: string,
  {
    meta = true,
    allowedKeyword = undefined,
    enabled = true,
  }: {
    /** @default true */
    meta?: boolean
    allowedKeyword?: string
    /** @default false */
    enabled?: boolean
  } = {},
) => {
  const ref = useRef<Elm>(null)

  useEffect(() => {
    if (enabled) {
      const handler = (e: KeyboardEvent) => {
        const activeElement = document.activeElement

        if (
          (!meta || e.metaKey) &&
          e.key === key &&
          (allowedKeyword == null ||
            (activeElement instanceof HTMLElement &&
              activeElement.dataset["hotkey"] === allowedKeyword))
        ) {
          ref.current?.click()
          e.preventDefault()
        }
      }
      window.addEventListener("keydown", handler)
      return () => window.removeEventListener("keydown", handler)
    }
  }, [allowedKeyword, enabled, key, meta])

  return ref
}
