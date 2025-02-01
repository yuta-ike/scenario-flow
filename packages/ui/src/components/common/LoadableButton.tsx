import { TbLoader } from "react-icons/tb"

import { Button } from "./Button"

import type { ComponentPropsWithoutRef } from "react"

type LoadableButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  loading: boolean
}

export const LoadableButton = ({
  children,
  loading,
  disabled,
  ...props
}: LoadableButtonProps) => {
  return (
    <div className="relative">
      <Button {...props} disabled={loading || disabled}>
        {children}
      </Button>
      {loading && (
        <div className="absolute inset-1 grid cursor-wait place-items-center bg-white">
          <TbLoader className="animate-spin" />
        </div>
      )}
    </div>
  )
}
