import { TbFile, TbFileImport } from "react-icons/tb"
import { useState } from "react"

import { ApiCallTile } from "./ApiCallTile"
import { ResourceTile } from "./ResourceTile"

import { useActionIds, useResourceIds } from "@/ui/adapter/query"
import { FormModal, FormModalContent } from "@/ui/lib/common/FormModal"
import { uploadOpenApiFile } from "@/ui/adapter/command"
import { readFile } from "@/ui/utils/readFile"
import { convertYamlToJson } from "@/ui/lib/yaml/yamlToJson"

type FormItemProps = {
  id: string
  label: string
  children: React.ReactNode
}

const FormItem = ({ id, label, children }: FormItemProps) => {
  return (
    <div className="flex flex-col gap-1 text-slate-700">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      {children}
    </div>
  )
}

export const BlockMenu = () => {
  const resourceIds = useResourceIds()

  const [isOpenModal, setOpenModal] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file == null) {
      return
    }
    if (name === "") {
      setName(file.name.split(".").slice(0, -1).join("."))
    }
    setFile(file)
    setOpenModal(true)
    e.target.value = ""
  }

  const handleSubmit = async () => {
    if (file == null) {
      return
    }

    const yaml = await readFile(file)
    const json = convertYamlToJson(yaml)
    await uploadOpenApiFile(name, description, json)

    setName("")
    setDescription("")
    setFile(null)
    setOpenModal(false)
  }

  const actionIds = useActionIds()

  return (
    <>
      <div className="flex max-h-full w-full flex-col p-2">
        <div className="flex h-full w-full flex-col gap-2 overflow-hidden">
          <input
            placeholder="検索"
            type="text"
            className="w-full rounded border border-transparent bg-slate-100 px-2 py-1.5 text-xs leading-none transition focus:border-slate-200 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1">
            {resourceIds.map((resourceId) => (
              <ResourceTile key={resourceId} resourceId={resourceId} />
            ))}
          </div>
          {0 < actionIds.length ? (
            <div className="flex flex-col gap-2 overflow-y-scroll">
              {actionIds.map((actionId) => (
                <ApiCallTile key={actionId} actionId={actionId} />
              ))}
            </div>
          ) : (
            <div className="relative flex w-full grow flex-col items-center gap-4 overflow-y-scroll rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-600 hover:bg-slate-100">
              <div className="text-lg font-bold">
                <TbFileImport size={32} />
              </div>
              <div className="text-xs">OpenAPIファイルをインポート</div>
              <input
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileUpload}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          )}
        </div>
      </div>
      <FormModal
        title="OpenAPIファイルのインポート"
        description="OpenAPIファイルをインポートする"
        isOpen={isOpenModal}
        onOpenChange={setOpenModal}
        modal={
          <FormModalContent onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <FormItem id="name" label="識別名">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm transition hover:bg-slate-50 focus:border-slate-500 focus:outline-none focus:hover:bg-white"
                />
              </FormItem>
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
                    onChange={handleFileUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              </FormItem>
              <FormItem id="description" label="補足説明">
                <input
                  type="text"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm transition hover:bg-slate-50 focus:border-slate-500 focus:outline-none focus:hover:bg-white"
                />
              </FormItem>
            </div>
          </FormModalContent>
        }
      />
    </>
  )
}
