import * as Dialog from "@radix-ui/react-dialog"
import { createContext, useContext, useMemo, useState } from "react"
import { FiX } from "react-icons/fi"

import { Button } from "./Button"
import { IconButton } from "./IconButton"

type ModalContextProps = {
  onClose: () => void
}
const ModalContext = createContext<ModalContextProps | null>(null)

export const useCustomModal = () => {
  const context = useContext(ModalContext)
  if (context == null) {
    throw new Error("Cannnot use useCsutomModal outside CustomModal")
  }
  return context
}

type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}

export const CustomModal = ({ children, modal }: Props) => {
  const [isOpen, setOpen] = useState(false)

  const contextValue = useMemo(
    () => ({
      onClose: () => setOpen(false),
    }),
    [],
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-black/40 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-10 flex max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-lg border-slate-200 bg-white text-slate-700 focus:outline-none data-[state=open]:animate-contentShow">
          <ModalContext.Provider value={contextValue}>
            {modal}
          </ModalContext.Provider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

type CustomModalContentProps = {
  children: React.ReactNode
  title: string
  okLabel?: string
  onSubmit?: () => void
  cancelLabel?: string
  disabled?: boolean
}

export const CustomModalContent = ({
  title,
  children,
  okLabel = "確定",
  cancelLabel = "キャンセル",
  onSubmit,
  disabled,
}: CustomModalContentProps) => {
  return (
    <div className="flex flex-col overflow-y-hidden">
      <div className="flex shrink-0 items-center justify-between px-6 py-5">
        <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
        <Dialog.Close asChild>
          <IconButton icon={FiX} label="閉じる" />
        </Dialog.Close>
      </div>
      <div className="grow overflow-y-auto border-y border-y-slate-200">
        {children}
      </div>
      <div className="flex shrink-0 justify-end gap-4 bg-white px-4 py-3">
        <Dialog.Close asChild>
          <Button type="reset" theme="secondary">
            {cancelLabel}
          </Button>
        </Dialog.Close>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <Button type="button" onClick={onSubmit} autoFocus disabled={disabled}>
          {okLabel}
        </Button>
      </div>
    </div>
  )
}
