import React from "react"

import type { IconType } from "react-icons"

export const ArrayIcon: IconType = ({
  size = 16,
  color = "currentColor",
  title,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title != null && <title>{title}</title>}
      <path
        d="M6.5 2.99997H4.35885C3.60838 2.99997 3 3.60835 3 4.35882V13.1913C3 13.9418 3.60838 14.5502 4.35885 14.5502H6.5M10.5 14.5H13C13.7505 14.5 14.2105 13.9418 14.2105 13.1913V4.35882C14.2105 3.60835 13.7505 2.99997 13 2.99997H10.5"
        stroke="black"
        stroke-width="2.15151"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
