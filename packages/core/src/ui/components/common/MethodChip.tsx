import clsx from "clsx"

import { HTTP_METHODS_MAP, type HttpMethod } from "@/utils/http"

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
