import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { TbFolder, TbX } from "react-icons/tb"

import { FormItem, FormModalContent, TextInput } from "@scenario-flow/ui"
import { nonNull } from "@scenario-flow/util"
import { DirHandle } from "../../../../injector"
import { useInjected } from "../../../lib/provider"

type FormData = {
  name: string
  dirHandle: DirHandle | null
}

type Props = {
  defaultValues: {
    dirHandle?: DirHandle
  }
  onSubmit: (name: string, dirHandle: DirHandle) => void
  cacheKey: string
}

export const CreateProjectModal = ({
  defaultValues,
  onSubmit,
  cacheKey,
}: Props) => {
  const injected = useInjected()

  const { register, control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: defaultValues.dirHandle?.path.split("/").at(-1) ?? "",
      ...defaultValues,
    },
  })

  const id = useId()
  return (
    <FormModalContent
      onSubmit={handleSubmit(({ name, dirHandle }) => {
        if (dirHandle == null) {
          return
        }
        onSubmit(name, dirHandle)
      })}
    >
      <div className="flex flex-col gap-4">
        <FormItem id={id} label="プロジェクト名" required>
          <TextInput
            id={id}
            placeholder="プロジェクト名"
            {...register("name", { required: true })}
            className="w-full rounded border border-slate-200 p-2"
          />
        </FormItem>
        <FormItem id={id} label="パス" required>
          <Controller
            name="dirHandle"
            control={control}
            render={({ field }) => (
              <div className="flex w-full items-center gap-2 rounded border border-slate-200 bg-slate-50 p-2 text-start text-sm text-slate-500">
                <button
                  type="button"
                  className="flex h-[1lh] grow items-center gap-2"
                  onBlur={field.onBlur}
                  onClick={async () => {
                    const dir = await injected.io.selectDir(undefined, {
                      cacheKey,
                    })
                    field.onChange(dir)
                  }}
                >
                  <TbFolder />
                  <hr className="h-auto self-stretch border-r border-r-slate-200" />
                  {field.value == null ? (
                    <span className="opacity-70">ディレクトリを選択</span>
                  ) : (
                    [field.value.path, field.value.name]
                      .filter(nonNull)
                      .join("/")
                  )}
                </button>
                {field.value != null && (
                  <button
                    className="shrink-0 rounded p-1 hover:bg-slate-200"
                    type="button"
                    onClick={() => field.onChange(null)}
                  >
                    <TbX />
                  </button>
                )}
              </div>
            )}
          />
        </FormItem>
      </div>
    </FormModalContent>
  )
}
