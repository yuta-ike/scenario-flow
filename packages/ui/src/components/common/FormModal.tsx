import * as Dialog from "@radix-ui/react-dialog"
import { HiX } from "react-icons/hi"
import {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { Button } from "./Button"

const FormModalContext = createContext<{
  title: string
  description: string
  onClose: () => void
} | null>(null)

type Ref = {
  close: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFormRef = () => useRef<Ref>(null)

type FormModalProps = {
  title: string
  description: string
  modal: React.ReactNode
  positiveLabel?: string
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

export const FormModal = forwardRef<Ref, FormModalProps>(
  (
    {
      children,
      title,
      description,
      modal,
      isOpen,
      onOpenChange,
    }: FormModalProps,
    ref,
  ) => {
    const [_isOpen, setOpen] = useState(false)

    const contextValue = useMemo(
      () => ({
        title,
        description,
        onClose: () => (onOpenChange ?? setOpen)(false),
      }),
      [title, description, onOpenChange],
    )

    useImperativeHandle(ref, () => ({
      close: () => (onOpenChange ?? setOpen)(false),
    }))

    return (
      <Dialog.Root
        open={isOpen ?? _isOpen}
        onOpenChange={onOpenChange ?? setOpen}
      >
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 z-10 bg-black/40" />
          <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-10 flex max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-lg border-slate-200 bg-white text-slate-700 focus:outline-none">
            <FormModalContext.Provider value={contextValue}>
              {modal}
            </FormModalContext.Provider>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  },
)

type FormModalContentProps = {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  okLabel?: string
  cancelLabel?: string
}

export const FormModalContent = ({
  children,
  onSubmit,
  okLabel = "追加する",
  cancelLabel = "キャンセル",
}: FormModalContentProps) => {
  const context = useContext(FormModalContext)
  if (context == null) {
    throw new Error()
  }
  const { title, description } = context
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(e)
      }}
      className="flex flex-col"
    >
      <div className="flex w-full shrink-0 justify-between px-4 py-6">
        <Dialog.Title className="text-lg">{title}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {description}
        </Dialog.Description>
        <Dialog.Close asChild>
          <button
            className="rounded p-1 transition hover:bg-slate-100"
            aria-label="Close"
            type="reset"
          >
            <HiX size={20} />
          </button>
        </Dialog.Close>
      </div>
      <div className="grow px-4 pb-6">{children}</div>
      <div className="flex shrink-0 justify-end gap-4 border-t border-t-slate-200 bg-slate-50 px-4 py-3">
        <Dialog.Close asChild>
          <Button type="reset" theme="secondary">
            {cancelLabel}
          </Button>
        </Dialog.Close>
        <Button type="submit">{okLabel}</Button>
      </div>
    </form>
  )
}

export const useCloseModal = () => {
  const context = useContext(FormModalContext)
  if (context == null) {
    throw new Error()
  }
  return context.onClose
}
