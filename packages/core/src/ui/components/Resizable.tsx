import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const ResizableContext = createContext<{
  setDelta: (value: number | null) => void
} | null>(null)

type Props = {
  children?: React.ReactNode
  initialWidth: number
}

export const Resizable = ({ children, initialWidth }: Props) => {
  const [delta, setDelta] = useState<number | null>(null)
  const [originalWidth, setOriginalWidth] = useState(initialWidth)

  const isDeltaSet = delta != null
  // useEffect(() => {
  //   if (delta != null) {
  //     return () => setOriginalWidth((prev) => prev + delta)
  //   }
  // }, [delta])

  return (
    <ResizableContext.Provider value={useMemo(() => ({ setDelta }), [])}>
      <div
        className="relative"
        style={{
          width: originalWidth + (delta ?? 0),
        }}
        ref={(e) => {
          if (e != null) {
            setOriginalWidth(e.getBoundingClientRect().width)
          }
        }}
      >
        {children}
      </div>
    </ResizableContext.Provider>
  )
}

const useSetDelta = () => {
  const context = useContext(ResizableContext)
  if (context == null) {
    throw new Error("Cannot use useSetDelta outside ResizableContext")
  }
  return context.setDelta
}

type Pos = {
  x: number
  y: number
}

type ResizeHandleProps = {
  children?: React.ReactNode
}

export const ResizeHandle = ({ children }: ResizeHandleProps) => {
  const setDelta = useSetDelta()

  const [originPos, setOriginPos] = useState<Pos | null>(null)
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    console.log("DOWN")
    setOriginPos({
      x: e.clientX,
      y: e.clientY,
    })
  }

  useEffect(() => {
    console.log("EFF")
    if (originPos == null) {
      return
    }
    const handler = (e: PointerEvent) => {
      console.log("MOVE")
      setDelta(e.clientX - originPos.x)
    }
    document.addEventListener("pointermove", handler)
    return () => document.removeEventListener("pointermove", handler)
  }, [])

  useEffect(() => {
    if (originPos == null) {
      return
    }
    const handler = () => {
      console.log("UP")
      setOriginPos(null)
      setDelta(null)
    }
    document.addEventListener("pointerup", handler)
    return () => document.removeEventListener("pointerup", handler)
  }, [originPos, setDelta])

  return (
    <button type="button" onPointerDown={handlePointerDown}>
      {children}
    </button>
  )
}
