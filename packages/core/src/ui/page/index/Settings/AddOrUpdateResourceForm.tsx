import { useState } from "react"
import { TbFile, TbFileImport, TbLink } from "react-icons/tb"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import type { Json } from "@/utils/json"
import type { ResourceId } from "@/domain/entity/resource/resource"

import { FormItem } from "@/ui/components/FormItem"
import { RadioPanel } from "@/ui/components/common/RadioPanel"
import { LoadableButton } from "@/ui/components/common/LoadableButton"
import { verifyRemoteopen_api } from "@/lib/fetch/verifyRemoteUrl"
import { FormModalContent, useCloseModal } from "@/ui/lib/common/FormModal"
import { readFile } from "@/ui/utils/readFile"
import { parseYaml } from "@/ui/lib/yaml/yamlToJson"
import { putOpenApiFile, uploadOpenApiFile } from "@/ui/adapter/command"
import { fetchJson } from "@/utils/fetchJson"

type FormData = {
  name: string
  description?: string
  file?: File
  url?: string
}

type AddOrUpdateResourceFormProps =
  | {
      type: "create"
      resourceId?: undefined

      name?: undefined
      description?: undefined
    }
  | {
      type: "update"
      resourceId: ResourceId
      name: string
      description: string
    }

export const AddOrUpdateResourceForm = ({
  type,
  resourceId,
  name,
  description,
}: AddOrUpdateResourceFormProps) => {
  const closeModal = useCloseModal()

  const [method, setMethod] = useState<"file" | "remote">("file")
  const { register, watch, setValue, getValues, handleSubmit } =
    useForm<FormData>({
      defaultValues: {
        name: name ?? "",
        description: description ?? "",
        file: undefined,
        url: undefined,
      },
    })

  const file = watch("file")

  const {
    mutateAsync: verifyLinkMutate,
    isPending,
    data: isValidUrlOrError,
  } = useMutation({
    mutationFn: verifyRemoteopen_api,
  })

  const handleAdd = handleSubmit(
    async (data) => {
      if (data.name.length == 0) {
        window.alert("名前は必須です")
        return
      }

      const json =
        method === "file"
          ? await readFile(file!)
              .then(parseYaml)
              .then((res) =>
                res.result === "success"
                  ? res.value
                  : // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                    Promise.reject(res.error),
              )
          : await fetchJson<Json>(data.url!)

      if (type === "create") {
        await uploadOpenApiFile(
          data.name,
          data.description ?? "",
          "TODO: PATH",
          json,
        )
      } else {
        await putOpenApiFile(
          resourceId,
          data.name,
          data.description ?? "",
          "TODO: PATH",
          json,
        )
      }
      closeModal()
    },
    (err) => {
      console.error(err)
      window.alert("エラーが発生しました")
    },
  )

  return (
    <FormModalContent
      onSubmit={handleAdd}
      okLabel={type === "create" ? "追加する" : "更新する"}
    >
      <div className="flex flex-col gap-4">
        <FormItem id="method" label="読み込み方法の選択" asFieldset>
          <div className="grid grid-cols-2 gap-2">
            <RadioPanel
              icon={TbFile}
              name="method"
              value="file"
              onChange={(e) => e.target.checked && setMethod("file")}
              defaultChecked={method === "file"}
            >
              ファイルからインポート
            </RadioPanel>
            <RadioPanel
              icon={TbLink}
              name="method"
              value="remote"
              onChange={(e) => e.target.checked && setMethod("remote")}
              defaultChecked={method === "remote"}
            >
              URLからインポート（未実装）
            </RadioPanel>
          </div>
        </FormItem>
        {method === "file" ? (
          <FormItem id="file" label="スキーマファイル">
            <div className="relative flex h-[96px] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-600 hover:bg-slate-100">
              {file != null ? (
                <div className="flex flex-col items-center">
                  <div className="text-lg font-bold">
                    <TbFile size={32} />
                  </div>
                  <div className="text-xs">{file.name}</div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold">
                    <TbFileImport size={32} />
                  </div>
                  <div className="text-xs">OpenAPIファイルをインポート</div>
                </>
              )}
              <input
                type="file"
                name="file"
                accept=".yaml,.yml"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file != null) {
                    setValue("file", file)
                    if (getValues("name") === "") {
                      setValue("name", file.name.replace(/\.[^.]+$/, ""))
                    }
                  }
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </FormItem>
        ) : (
          <FormItem id="file" label="リモートURL">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com"
                {...register("url")}
                className="w-full grow rounded-md border border-slate-200 bg-white p-2 text-sm transition hover:bg-slate-50 focus:border-slate-500 focus:outline-none focus:hover:bg-white"
              />
              <div className="shrink-0">
                <LoadableButton
                  loading={isPending}
                  theme="secondary"
                  onClick={async () => {
                    const url = getValues("url")
                    if (url == null) {
                      return
                    }
                    await verifyLinkMutate(url)
                  }}
                >
                  検証
                </LoadableButton>
              </div>
            </div>
            <div className="mt-1 min-h-[1lh] text-xs">
              {isValidUrlOrError === true && (
                <div className="text-green-600">有効なURLです</div>
              )}
              {typeof isValidUrlOrError === "string" && (
                <div className="text-red-500">{isValidUrlOrError}</div>
              )}
            </div>
          </FormItem>
        )}
        <FormItem id="name" label="名前">
          <input
            type="text"
            {...register("name", { required: true })}
            className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm transition hover:bg-slate-50 focus:border-slate-500 focus:outline-none focus:hover:bg-white"
          />
        </FormItem>
        <FormItem id="description" label="補足説明">
          <input
            type="text"
            {...register("description")}
            className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm transition hover:bg-slate-50 focus:border-slate-500 focus:outline-none focus:hover:bg-white"
          />
        </FormItem>
      </div>
    </FormModalContent>
  )
}
