import React, { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"

type DrawerProps = {
  title: string
  description: string
  modal: React.ReactNode
} & (
  | {
      children: React.ReactNode
      isOpen?: undefined
      onOpenChange?: undefined
    }
  | {
      children?: undefined
      isOpen: boolean
      onOpenChange: (open: boolean) => void
    }
)

export const Drawer = ({
  children,
  title,
  description,
  modal,
  isOpen,
  onOpenChange,
}: DrawerProps) => {
  const [_isOpen, setOpen] = useState(false)

  return (
    <Dialog.Root
      open={isOpen ?? _isOpen}
      onOpenChange={onOpenChange ?? setOpen}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="data-[state=open]:animate-drawerShow fixed bottom-0 right-0 top-0 flex w-[600px] max-w-[100vw] flex-col overflow-y-auto overflow-x-hidden border-slate-200 bg-white text-slate-700 focus:outline-none">
          <Dialog.Title className="sticky top-0 z-10 border-b border-b-slate-200 bg-white/80 p-4 text-xl font-bold backdrop-blur">
            {title}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {description}
          </Dialog.Description>
          <div className="p-4 pt-0">{modal}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
