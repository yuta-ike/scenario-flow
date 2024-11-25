import "react"

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number
    "-webkit-tap-highlight-color"?: string
  }
}
