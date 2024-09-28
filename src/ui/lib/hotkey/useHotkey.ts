import { useEffect, useRef } from "react"

// https://developer.mozilla.org/ja/docs/Web/API/UI_Events/Keyboard_event_key_values
export const useHotkey = <Elm extends HTMLElement = HTMLElement>(
  key: string,
) => {
  const ref = useRef<Elm>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === key) {
        ref.current?.click()
        e.preventDefault()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [key])

  return ref
}
