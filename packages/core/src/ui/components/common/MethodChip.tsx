import { HttpMethod, HTTP_METHODS_MAP } from "@scenario-flow/util"
import clsx from "clsx"

type Props = {
  children: HttpMethod
  size?: "sm" | "lg"
  truncate?: number
}

export const MethodChip = ({ children, truncate, size = "sm" }: Props) => {
  const color = HTTP_METHODS_MAP[children].color
  return (
    <div
      className={clsx(size === "sm" ? "text-xs font-bold" : "font-bold")}
      style={{ color }}
    >
      {truncate != null ? children.slice(0, truncate) : children}
    </div>
  )
}
