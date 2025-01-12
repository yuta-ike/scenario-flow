import { useId, useImperativeHandle, useRef, useState } from "react"
import { TbEdit, TbFlag2 } from "react-icons/tb"
import { useForm } from "react-hook-form"
import { flushSync } from "react-dom"
import clsx from "clsx"

import { usePage, usePrimitiveRoutesInPage } from "@/ui/state/page"
import { updatePageName } from "@/ui/adapter/command"

type FormData = {
  name: string
}

type Props = {
  page: string
  frag: string
  isRoot?: boolean
}

export const PageTitle = ({ page, frag, isRoot = false }: Props) => {
  const { currentPage, select } = usePage()
  const routes = usePrimitiveRoutesInPage(page)

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: { name: page },
  })
  const [inEdit, setInEdit] = useState(false)

  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit = handleSubmit((data) => {
    updatePageName({ prevPage: page, newPage: data.name })
  })

  const { ref, ...rest } = register("name", { required: true })
  useImperativeHandle(ref, () => inputRef.current)

  return (
    <div
      data-selected={page === currentPage}
      className="group relative flex w-full items-center justify-between rounded-l data-[selected=true]:bg-slate-100"
    >
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => select(page)}
        aria-describedby={id}
      />
      {inEdit ? (
        <form
          className="z-10 grow px-1.5 py-px"
          onSubmit={async (e) => {
            e.preventDefault()
            setInEdit(false)
            await onSubmit(e)
          }}
        >
          <input
            id={id}
            type="text"
            className="w-full rounded border border-transparent bg-white py-1 text-xs transition-[padding] hover:border-slate-200 hover:px-1 focus:px-1 focus:outline-none focus-visible:border-slate-400 group-data-[selected=true]:font-bold"
            ref={inputRef}
            {...rest}
            onBlur={() => {
              setInEdit(false)
            }}
          />
        </form>
      ) : (
        <div className="w-full grow rounded border border-transparent px-1.5 py-1.5 text-xs transition-[padding] hover:border-slate-200 hover:px-1 focus:px-1 group-data-[selected=true]:font-bold">
          {frag}
        </div>
      )}
      {!inEdit && (
        <>
          <div className="flex items-center">
            {routes.slice(0, 4).map((route) => (
              <div key={route.id}>
                <TbFlag2
                  style={{
                    color: route.color,
                  }}
                  className="fill-current"
                />
              </div>
            ))}
            {4 < routes.length && (
              <div className="ml-1 rounded-full text-xs leading-none text-slate-600">
                +{routes.length - 4}
              </div>
            )}
          </div>
          <button
            type="button"
            title="ページ名を編集"
            onClick={() => {
              flushSync(() => setInEdit(true))
              inputRef.current?.focus()
            }}
            className={clsx(
              "z-10 rounded border border-transparent p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-800 focus:border-slate-300 focus:bg-slate-100 focus:opacity-100 focus:outline-none group-hover:opacity-100",
              isRoot && "invisible",
            )}
          >
            <TbEdit size={16} stroke="currentColor" />
          </button>
        </>
      )}
    </div>
  )
}
