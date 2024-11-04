import { useState } from "react"

import { ApiCallTile } from "./ApiCallTile"
import { ResourceTile } from "./ResourceTile"

import type { FileContent } from "@/utils/file"

import { useActionIds, useResourceIds } from "@/ui/adapter/query"
import { FormModal, FormModalContent } from "@/ui/lib/common/FormModal"
import { uploadOpenApiFile } from "@/ui/adapter/command"
import { parseYaml } from "@/ui/lib/yaml/yamlToJson"
import { display } from "@/domain/entity/action/identifier"
import { FileInput } from "@/ui/components/common/FileInput"

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

const stripExtension = (name: string) => name.replace(/\.[^.]*$/, "")

export const BlockMenu = () => {
  const resourceIds = useResourceIds()

  const [isOpenModal, setOpenModal] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<FileContent | null>(null)

  const handleFileUpload = (file: FileContent | null) => {
    if (file == null) {
      return
    }
    const fileName = stripExtension(file.name)
    if (name === "") {
      setName(fileName)
    }
    setFile(file)
    setOpenModal(true)
  }

  const handleSubmit = async () => {
    if (file == null) {
      return
    }

    const json = parseYaml(file.content)
    if (json.result === "error") {
      window.alert("ファイルの読み込みに失敗しました")
      return
    }
    const result = await uploadOpenApiFile(
      name,
      description,
      file.path,
      json.value,
    )
    if (result.result === "error") {
      window.alert("OpenAPIファイルの形式が正しくありません")
      return
    }

    setName("")
    setDescription("")
    setFile(null)
    setOpenModal(false)
  }

  const identifiers = useActionIds()

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
          {0 < identifiers.length ? (
            <div className="flex flex-col gap-2 overflow-y-scroll">
              {identifiers.map((identifier) => (
                <ApiCallTile
                  key={display(identifier)}
                  actionIdentifier={identifier}
                />
              ))}
            </div>
          ) : (
            <FileInput value={file} onChange={handleFileUpload} />
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
                <FileInput value={file} onChange={setFile} />
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
