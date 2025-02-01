import { useEffect, useRef, useState } from "react"

import type { ReactNode } from "react"

type TransitionProps = {
  children: ReactNode
  show: boolean
  delay?: number
}

export const Transition = ({
  children,
  show,
  delay = 500,
}: TransitionProps) => {
  const [delayedShow, setDelayedShow] = useState(show)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (show) {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      setDelayedShow(true)
      return () => {
        timerRef.current = setTimeout(() => setDelayedShow(false), delay)
      }
    }
  }, [show, delay])

  if (show || delayedShow) {
    return children
  } else {
    return null
  }
}
